import { readFileSync, writeFileSync } from 'fs';
import child_process from 'child_process';
import path from 'path';
import supertest from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '../../../src/AppModule';
import { Customer } from '../../../src/customer/entity/Customer';
import { Host } from '../../../src/host/entity/Host';

import { IOrderRepository } from '../../../src/order/persistence/IOrderRepository';
import { IDraftOrder } from '../../../src/order/application/DraftOrder/IDraftOrder';
import { Country } from '../../../src/order/entity/Country';
import { isString } from 'class-validator';
import { IHostRepository } from '../../../src/host/persistence/IHostRepository';
import {
  DraftedOrder,
  ConfirmedOrder,
  OrderStatus,
} from '../../../src/order/entity/Order';
import { Email, UUID } from '../../../src/common/domain';
import { ConfigService } from '@nestjs/config';
import { ConfirmOrderResult } from '../../../src/order/application/ConfirmOrder/IConfirmOrder';
import { setupNestApp } from '../../../src/main';
import { authorize, createTestCustomer } from '../utilities';
import { IDeleteCustomer } from '../../../src/customer/application/DeleteCustomer/IDeleteCustomer';
import { IDeleteOrder } from '../../../src/order/application/DeleteOrder/IDeleteOrder';
import { originCountriesAvailable } from '../../../src/calculator/data/PriceGuide';

type HostConfig = {
  email: Email;
  verified: boolean;
  country: Country;
  available: boolean;
  orderCount: number;
};

describe('Confirm Order – POST /order/confirm', () => {
  let app: INestApplication;
  let agent: ReturnType<typeof supertest.agent>;

  let order: DraftedOrder;
  let draftOrder: IDraftOrder;
  let deleteOrder: IDeleteOrder;
  let orderRepository: IOrderRepository;

  let customer: Customer;
  let deleteCustomer: IDeleteCustomer;

  let hosts: Host[];
  let hostRepository: IHostRepository;

  let stripeListener: child_process.ChildProcess;

  const originCountry: Country = originCountriesAvailable[0];

  beforeAll(async () => {
    // Setting timeout in before*(): https://stackoverflow.com/a/67392078/6539857
    // https://stackoverflow.com/a/49864436/6539857
    jest.setTimeout(50000);

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication(undefined, {
      bodyParser: false,
    });
    await setupNestApp(app);
    await app.init();

    const configService = await moduleRef.resolve(ConfigService);

    orderRepository = await moduleRef.resolve(IOrderRepository);
    hostRepository = await moduleRef.resolve(IHostRepository);
    draftOrder = await moduleRef.resolve(IDraftOrder);
    deleteOrder = await moduleRef.resolve(IDeleteOrder);

    ({ customer, deleteCustomer } = await createTestCustomer(moduleRef));

    agent = await authorize(app, moduleRef, customer.email);

    stripeListener = child_process.spawn('stripe', [
      'listen',
      '--forward-to',
      `localhost:3000/${configService.get<string>('STRIPE_WEBHOOK_PATH')}`,
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
    order = await draftOrder.execute({
      port: {
        customerId: customer.id,
        originCountry,
        destination: customer.addresses[0],
        items: [
          {
            title: 'Laptop',
            storeName: 'Amazon',
            weight: 10,
          },
        ],
      },
    });
  });

  afterEach(async () => {
    await Promise.allSettled([
      hostRepository.deleteManyHosts(hosts.map(({ id }) => id)),
      deleteOrder.execute({
        port: { customerId: customer.id, orderId: order.id },
      }),
    ]);
  });

  afterAll(async () => {
    await Promise.allSettled([
      deleteCustomer.execute({ port: { customerId: customer.id } }),
    ]);

    stripeListener.kill();
    await app.close();
  });

  it(`Matches Order with a Host, updates Order's "hostId" property, and Host's "orderIds" property`, async () => {
    // TODO: Vary 'verified' true-false
    const testHostConfigs: HostConfig[] = [
      /*
      Test host #1:
      ✗ NOT verified
      ✔ available
      ✔ same country as the order
      ✔ lowest number of orders (1)
      */
      {
        email: 'johndoe@example.com',
        verified: false,
        country: originCountry,
        available: true,
        orderCount: 1,
      },
      /*
      Test host #2:
      ✗ NOT available
      ✔ verified
      ✔ same country as the order
      ✔ lowest number of orders (1)
      */
      {
        email: 'johndoe@example.com',
        verified: true,
        country: originCountry,
        available: false,
        orderCount: 1,
      },
      /*
      Test host #3:
      ✗ NOT the same country as the order
      ✔ verified
      ✔ available
      ✔ lowest number of orders (1)
      */
      {
        email: 'johndoe@example.com',
        verified: true,
        country: 'XXX' as Country,
        available: true,
        orderCount: 1,
      },
      /*
      Test host #4:
      ✗ NOT the lowest number of orders (2)
      ✔ verified
      ✔ same country as the order
      ✔ available
      */
      {
        email: 'johndoe@example.com',
        verified: true,
        country: originCountry,
        available: true,
        orderCount: 2,
      },
      /*
      Test host #5:
      ✗ NOT the lowest number of orders (2)
      ✗ NOT the same country as the order
      ✗ NOT available
      ✗ verified
      */
      {
        email: 'johndoe@example.com',
        verified: false,
        country: 'ZZZ' as Country,
        available: false,
        orderCount: 3,
      },
      /*
      Test host #6 (WILL BE SELECTED):
      ✔ available
      ✔ verified
      ✔ same country as the order
      ✔ lowest number of orders (1)
      */
      {
        email: 'johndoe@example.com',
        verified: true,
        country: originCountry,
        available: true,
        orderCount: 1,
      },
    ];
    hosts = configsToHosts(testHostConfigs);
    await hostRepository.addManyHosts(hosts);

    const testMatchedHost = hosts[hosts.length - 1];

    const response: supertest.Response = await agent
      .post('/order/confirm')
      .send({
        orderId: order.id,
      });

    expect(response.status).toBe(HttpStatus.CREATED);

    const { checkoutId } = response.body as ConfirmOrderResult;

    expect(checkoutId).toBeDefined();
    expect(isString(checkoutId)).toBe(true);
    expect(checkoutId.slice(0, 2)).toBe('cs'); // "Checkout Session"

    updatedStripeCheckoutSessionInTestPage(checkoutId);

    await fillStripeCheckoutForm();

    await new Promise(res => setTimeout(res, 15000));

    await page.screenshot({
      path: './test/e2e/order/stripe_form_result.png',
      fullPage: true,
    });

    let updatedTestOrder: ConfirmedOrder;

    updatedTestOrder = (await orderRepository.findOrder(
      {
        orderId: order.id,
        status: OrderStatus.Confirmed,
      },
      undefined,
      false,
    )) as ConfirmedOrder;

    expect(updatedTestOrder).toBeDefined();

    expect(updatedTestOrder.hostId).toBeDefined();
    expect(updatedTestOrder.hostId).toBe(testMatchedHost.id);

    const updatedTestHost: Host = await hostRepository.findHost({
      hostId: testMatchedHost.id,
    });

    expect(updatedTestHost.orderIds).toContain(order.id);
    expect(updatedTestHost.orderIds.length).toBe(
      testMatchedHost.orderIds.length + 1,
    );
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
      country => ({
        country,
        available: true,
        orderCount: 1,
        verified: true,
        email: 'johndoe@example.com',
      }),
    );
    hosts = configsToHosts(testHostConfigs);
    await hostRepository.addManyHosts(hosts);

    const response: supertest.Response = await agent
      .post('/order/confirm')
      .send({
        orderId: order.id,
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
    'file:///Users/rafaelsofizadeh/Documents/Developer/LOCLY-DDD/test/e2e/order/CheckoutPage.html',
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
  // @ts-ignore
  return hostConfigs.map(
    ({ email, country, available, orderCount, verified }) => ({
      id: UUID(),
      email,
      address: { country },
      verified,
      available,
      orderIds: generateUuids(orderCount),
    }),
  );
}
