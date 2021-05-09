import { readFileSync, writeFileSync } from 'fs';
import * as child_process from 'child_process';
import * as path from 'path';
import * as supertest from 'supertest';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '../../../../src/AppModule';
import { Customer } from '../../../../src/order/entity/Customer';
import { Host } from '../../../../src/order/entity/Host';

import { CustomerRepository } from '../../../../src/customer/persistence/CustomerRepository';
import { OrderRepository } from '../../../../src/order/persistence/OrderRepository';
import { DraftOrderUseCase } from '../../../../src/order/application/DraftOrder/DraftOrderUseCase';
import { Country } from '../../../../src/order/entity/Country';
import { isString } from 'class-validator';
import { HostRepository } from '../../../../src/host/persistence/HostRepository';
import { StripeCheckoutSessionResult } from '../../../../src/order/application/PreConfirmOrder/PreConfirmOrderUseCase';
import {
  DraftedOrder,
  ConfirmedOrder,
  OrderStatus,
} from '../../../../src/order/entity/Order';
import { UUID } from '../../../../src/common/domain';
import { CustomExceptionFilter } from '../../../../src/infrastructure/CustomExceptionFilter';
import {
  getDestinationCountriesAvailable,
  originCountriesAvailable,
} from '../../../../src/calculator/data/PriceGuide';

type HostConfig = {
  country: Country;
  available: boolean;
  orderCount: number;
};

describe('Confirm Order – POST /order/confirm', () => {
  let app: INestApplication;

  let customerRepository: CustomerRepository;
  let orderRepository: OrderRepository;
  let hostRepository: HostRepository;

  let draftOrderUseCase: DraftOrderUseCase;

  let testCustomer: Customer;
  let testOrder: DraftedOrder;
  let testHosts: Host[];

  let stripeListener: child_process.ChildProcess;

  const originCountry: Country = originCountriesAvailable[0];
  const destinationCountry: Country = getDestinationCountriesAvailable(
    originCountry,
  )[0];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication(undefined, { bodyParser: false });

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new CustomExceptionFilter());

    await app.listen(3000);

    customerRepository = (await moduleRef.resolve(
      CustomerRepository,
    )) as CustomerRepository;

    orderRepository = (await moduleRef.resolve(
      OrderRepository,
    )) as OrderRepository;

    hostRepository = (await moduleRef.resolve(
      HostRepository,
    )) as HostRepository;

    draftOrderUseCase = (await moduleRef.resolve(
      DraftOrderUseCase,
    )) as DraftOrderUseCase;

    testCustomer = {
      id: UUID(),
      selectedAddress: { country: destinationCountry },
      orderIds: [],
    };

    await customerRepository.addCustomer(testCustomer);

    stripeListener = child_process.spawn('stripe', [
      'listen',
      '--forward-to',
      'localhost:3000/stripe/webhook',
    ]);

    await new Promise(resolve => {
      const stdHandler = (data: Buffer) => {
        if (data.toString().includes('Ready!')) {
          return resolve('Stripe finished');
        }
      };

      stripeListener.stdout.on('data', stdHandler);
      stripeListener.stderr.on('data', stdHandler);
    });
  });

  beforeEach(async () => {
    testOrder = await draftOrderUseCase.execute({
      customerId: testCustomer.id,
      originCountry,
      destination: testCustomer.selectedAddress,
      items: [
        {
          title: 'Laptop',
          storeName: 'Amazon',
          weight: 10,
        },
      ],
    });
  });

  afterEach(async () => {
    await Promise.allSettled([
      hostRepository.deleteManyHosts(testHosts.map(({ id }) => id)),
      orderRepository.deleteOrder({ orderId: testOrder.id }),
    ]);
  });

  afterAll(async () => {
    await Promise.allSettled([
      customerRepository.deleteCustomer(testCustomer.id),
    ]);

    stripeListener.kill();
    await app.close();
  });

  it.only(`Matches Order with a Host, updates Order's "hostId" property, and Host's "orderIds" property`, async (done) /* done() is needed for "awaiting" setTimeout */ => {
    // https://stackoverflow.com/a/49864436/6539857
    jest.setTimeout(55000);

    const testHostConfigs: HostConfig[] = [
      /*
      Test host #1 (will be selected):
      ✔ available
      ✔ same country as the testOrder
      ✔ lowest number of orders (1)
      */
      {
        country: originCountry,
        available: true,
        orderCount: 1,
      },
      /*
      Test host #2:
      ✗ NOT available
      ✔ same country as the testOrder
      ✔ lowest number of orders (1)
      */
      {
        country: originCountry,
        available: false,
        orderCount: 1,
      },
      /*
      Test host #3:
      ✗ NOT the same country as the testOrder
      ✔ available
      ✔ lowest number of orders (1)
      */
      {
        country: originCountriesAvailable[1] || ('XXX' as Country),
        available: true,
        orderCount: 1,
      },
      /*
      Test host #4:
      ✗ NOT the lowest number of orders (2)
      ✔ same country as the testOrder
      ✔ available
      */
      {
        country: originCountry,
        available: true,
        orderCount: 2,
      },
      /*
      Test host #5:
      ✗ NOT the lowest number of orders (2)
      ✗ NOT the same country as the testOrder
      ✗ NOT available
      */
      {
        country: originCountriesAvailable[2] || ('ZZZ' as Country),
        available: false,
        orderCount: 3,
      },
    ];
    testHosts = configsToHosts(testHostConfigs);
    await hostRepository.addManyHosts(testHosts);

    const testMatchedHost = testHosts[0];

    const response: supertest.Response = await supertest(app.getHttpServer())
      .post('/order/confirm')
      .send({
        orderId: testOrder.id,
        customerId: testCustomer.id,
      });

    expect(response.status).toBe(HttpStatus.CREATED);

    const { checkoutId } = response.body as StripeCheckoutSessionResult;

    expect(checkoutId).toBeDefined();
    expect(isString(checkoutId)).toBe(true);
    expect(checkoutId.slice(0, 2)).toBe('cs'); // "Checkout Session"

    updatedStripeCheckoutSessionInTestPage(checkoutId);

    await fillStripeCheckoutForm();

    setTimeout(async () => {
      await page.screenshot({
        path: './test/e2e/tests/order/stripe_form_result.png',
        fullPage: true,
      });

      let updatedTestOrder: ConfirmedOrder;

      // Expect to resolve and not throw/reject
      await expect(
        (async () => {
          updatedTestOrder = (await orderRepository.findOrder({
            orderId: testOrder.id,
            status: OrderStatus.Confirmed,
          })) as ConfirmedOrder;
        })(),
      ).resolves.toBeUndefined();

      expect(updatedTestOrder.hostId).toBeDefined();
      expect(updatedTestOrder.hostId).toBe(testMatchedHost.id);

      const updatedTestHost: Host = await hostRepository.findHost(
        testMatchedHost.id,
      );

      expect(updatedTestHost.orderIds).toContain(testOrder.id);
      expect(updatedTestHost.orderIds.length).toBe(
        testMatchedHost.orderIds.length + 1,
      );

      // Called at the end of setTimeout to allow setTimeout to block the test case.
      done();
    }, 15000);
  });

  it(`Doesn't match Order with a Host as no Host is available in given country`, async () => {
    // https://stackoverflow.com/a/49864436/6539857
    // All hosts are available, but none are in the given country
    const incompatibleCountries = ([
      'XXX',
      'YYY',
      'ZZZ',
    ] as unknown[]) as Country[];

    const testHostConfigs: HostConfig[] = incompatibleCountries.map(
      country => ({ country, available: true, orderCount: 1 }),
    );
    testHosts = configsToHosts(testHostConfigs);
    await hostRepository.addManyHosts(testHosts);

    const response: supertest.Response = await supertest(app.getHttpServer())
      .post('/order/confirm')
      .send({
        orderId: testOrder.id,
        customerId: testCustomer.id,
      });

    expect(response.status).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(response.body.message).toMatch(
      // TODO: Remove necessity for the entire string (toMatch apparently doesn't work with non-exact matches)
      new RegExp(
        `${
          HttpStatus[HttpStatus.SERVICE_UNAVAILABLE]
        } | No available host: \(originCountry: ${originCountry}\)`,
      ),
    );
  });
});

function updatedStripeCheckoutSessionInTestPage(checkoutId: string) {
  const checkoutPagePath = path.join(__dirname, './CheckoutPage.html');

  const checkoutPage: string = readFileSync(checkoutPagePath, 'utf8');

  const updatedStripeCheckoutSessionFileContent = checkoutPage.replace(
    /cs_test_[\w\d]+/g,
    checkoutId,
  );

  writeFileSync(
    checkoutPagePath,
    updatedStripeCheckoutSessionFileContent,
    'utf8',
  );
}

// TODO: Retry on Stripe form error (will eliminate majority of test failures)
async function fillStripeCheckoutForm(): Promise<void> {
  const typingOptions = { delay: 100 };
  const testCardNumber = '4242424242424242';
  const testCardExpirty = '0424';
  const testCardCvc = '100';
  const testNameOnCard = 'TEST TESTOV';

  await page.goto(
    'file:///Users/rafaelsofizadeh/Documents/Developer/LOCLY-DDD/test/e2e/tests/order/CheckoutPage.html',
  );
  await page.click('#checkout-button');

  await page.waitForSelector('#cardNumber');
  await page.click('#cardNumber');
  await page.focus('#cardNumber');
  await page.keyboard.type(testCardNumber, typingOptions);

  await page.click('#cardExpiry');
  await page.focus('#cardExpiry');
  await page.keyboard.type(testCardExpirty, typingOptions);

  await page.click('#cardCvc');
  await page.focus('#cardCvc');
  await page.keyboard.type(testCardCvc, typingOptions);

  await page.click('#billingName');
  await page.focus('#billingName');
  await page.keyboard.type(testNameOnCard, typingOptions);

  await page.evaluate(() => {
    (document.getElementsByClassName(
      'SubmitButton-IconContainer',
    )[0] as HTMLElement).click();
  });
}

function generateUuids(n: number) {
  const uuids: UUID[] = [];

  for (let i = 0; i < n; i++) {
    uuids.push(UUID());
  }

  return uuids;
}

function configsToHosts(hostConfigs: HostConfig[]): Host[] {
  return hostConfigs.map(({ country, available, orderCount }) => ({
    id: UUID(),
    address: { country },
    available,
    orderIds: generateUuids(orderCount),
  }));
}
