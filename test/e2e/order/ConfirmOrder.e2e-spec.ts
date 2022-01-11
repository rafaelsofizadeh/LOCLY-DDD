import child_process from 'child_process';
import supertest from 'supertest';
import Stripe from 'stripe';
import { STRIPE_CLIENT_TOKEN } from '@golevelup/nestjs-stripe';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import appConfig from '../../../app.configuration';

import { AppModule } from '../../../src/AppModule';
import { Customer } from '../../../src/customer/entity/Customer';
import { Host } from '../../../src/host/entity/Host';

import { IOrderRepository } from '../../../src/order/persistence/IOrderRepository';
import { IDraftOrder } from '../../../src/order/application/DraftOrder/IDraftOrder';
import { Country } from '../../../src/order/entity/Country';
import { IHostRepository } from '../../../src/host/persistence/IHostRepository';
import {
  DraftedOrder,
  ConfirmedOrder,
  OrderStatus,
} from '../../../src/order/entity/Order';
import { IConfirmOrder } from '../../../src/order/application/ConfirmOrder/IConfirmOrder';
import { setupNestApp } from '../../../src/main';
import {
  authorize,
  createTestCustomer,
  createTestHost,
  initStripe,
  testCheckoutResponse,
} from '../utilities';
import { IDeleteCustomer } from '../../../src/customer/application/DeleteCustomer/IDeleteCustomer';
import { IDeleteOrder } from '../../../src/order/application/DeleteOrder/IDeleteOrder';
import { originCountriesAvailable } from '../../../src/calculator/data/PriceGuide';
import { UserType } from '../../../src/auth/entity/Token';
import { calculateStripeFee } from '../../../src/common/application';
import { UUID } from '../../../src/common/domain';

type HostConfig = {
  verified: boolean;
  country: Country;
  available: boolean;
  orderCount: number;
};

jest.setTimeout(50000);

describe('Confirm Order – POST /order/confirm', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let agent: ReturnType<typeof supertest.agent>;
  let stripe: Stripe;
  let configService: ConfigService;

  let order: DraftedOrder;
  let draftOrder: IDraftOrder;
  let confirmOrder: IConfirmOrder;
  let deleteOrder: IDeleteOrder;
  let orderRepository: IOrderRepository;

  let customer: Customer;
  let deleteCustomer: IDeleteCustomer;

  let hosts: Host[];
  let hostRepository: IHostRepository;

  let stripeListener: child_process.ChildProcess;

  const originCountry: Country = originCountriesAvailable[0];

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication(undefined, {
      bodyParser: false,
    });
    setupNestApp(app);
    await app.init();

    stripe = await moduleRef.resolve(STRIPE_CLIENT_TOKEN);
    configService = await moduleRef.resolve(ConfigService);

    orderRepository = await moduleRef.resolve(IOrderRepository);
    hostRepository = await moduleRef.resolve(IHostRepository);
    draftOrder = await moduleRef.resolve(IDraftOrder);
    confirmOrder = await moduleRef.resolve(IConfirmOrder);
    deleteOrder = await moduleRef.resolve(IDeleteOrder);

    ({ customer, deleteCustomer } = await createTestCustomer(moduleRef));

    ({ agent } = await authorize(
      app,
      moduleRef,
      customer.email,
      UserType.Customer,
    ));

    stripeListener = await initStripe(configService);
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
            url: 'https://amazon.com',
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

  it(`Matches Order with a Host, completes Stripe checkout for Locly service fee payment`, async () => {
    const notOriginCountries: Country[] = originCountriesAvailable.filter(
      country => country !== originCountry,
    );
    const notOriginCountry: Country =
      notOriginCountries[Math.floor(Math.random() * notOriginCountries.length)];
    const testHostConfigs: HostConfig[] = [
      /*
      Test host #1:
      ✗ NOT verified
      ✔ available
      ✔ same country as the order
      ✔ lowest number of orders (1)
      */
      {
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
        verified: true,
        country: notOriginCountry,
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
        verified: false,
        country: notOriginCountry,
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
        verified: true,
        country: originCountry,
        available: true,
        orderCount: 1,
      },
    ];
    hosts = await configsToOnboardedHosts(moduleRef, testHostConfigs);
    const testMatchedHost = hosts.slice(-1)[0];

    const loclyStripeBalanceBefore: Stripe.Balance = await stripe.balance.retrieve();
    const hostStripeBalanceBefore: Stripe.Balance = await stripe.balance.retrieve(
      { stripeAccount: testMatchedHost.stripeAccountId },
    );

    const response: supertest.Response = await agent
      .post('/order/confirm')
      .send({
        orderId: order.id,
      });

    expect(response.status).toBe(HttpStatus.CREATED);

    await testCheckoutResponse(response);

    let updatedOrder: ConfirmedOrder = (await orderRepository.findOrder({
      orderId: order.id,
    })) as ConfirmedOrder;

    expect(updatedOrder).toBeDefined();
    expect(updatedOrder.status).toBe(OrderStatus.Confirmed);
    expect(updatedOrder.hostId).toBe(testMatchedHost.id);
    expect(updatedOrder.hostAddress).toMatchObject(testMatchedHost.address);

    const updatedTestHost: Host = await hostRepository.findHost({
      hostId: testMatchedHost.id,
    });

    expect(updatedTestHost.orderIds).toContain(order.id);
    expect(updatedTestHost.orderIds.length).toBe(
      testMatchedHost.orderIds.length + 1,
    );

    const loclyStripeBalanceAfter: Stripe.Balance = await stripe.balance.retrieve();
    const hostStripeBalanceAfter: Stripe.Balance = await stripe.balance.retrieve(
      { stripeAccount: testMatchedHost.stripeAccountId },
    );

    const priceId: string = configService.get('LOCLY_FEE_PRICE_ID');
    const { total, loclyFee } = await confirmOrder.calculateLoclyCut(priceId);

    const findBalance = ({ pending }: Stripe.Balance) =>
      pending.find(({ currency }) => currency === total.currency);

    const [
      loclyPendingBefore,
      loclyPendingAfter,
      hostPendingBefore,
      hostPendingAfter,
    ] = [
      loclyStripeBalanceBefore,
      loclyStripeBalanceAfter,
      hostStripeBalanceBefore,
      hostStripeBalanceAfter,
    ].map(findBalance);

    // Stripe fee (without conversion): 2.9% + $0.3
    // https://stripe.com/pricing
    const stripeFee = calculateStripeFee(total);
    const loclyAfterStripeFee = loclyFee.unit_amount - stripeFee;

    expect(loclyPendingAfter.amount - loclyPendingBefore.amount).toBe(
      loclyAfterStripeFee,
    );

    expect(hostPendingAfter.amount - hostPendingBefore.amount).toBe(
      total.unit_amount - loclyFee.unit_amount,
    );
  });

  it(`Doesn't match Order with a Host as no Host is available in given country`, async () => {
    // https://stackoverflow.com/a/49864436/6539857
    const incompatibleCountries = ([
      'XXX',
      'YYY',
      'ZZZ',
    ] as unknown[]) as Country[];

    // All hosts are available, but none are in the given country
    const testHostConfigs: HostConfig[] = incompatibleCountries.map(
      country => ({
        country,
        available: true,
        orderCount: 1,
        verified: true,
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

function configsToHosts(hostConfigs: HostConfig[]): Host[] {
  // @ts-ignore
  return hostConfigs.map(({ country, available, orderCount, verified }) => ({
    id: UUID(),
    email: UUID() + '@gmail.com',
    address: { country },
    verified,
    available,
    orderIds: Array(orderCount)
      .fill('')
      .map(() => UUID()),
  }));
}

async function configsToOnboardedHosts(
  moduleRef: TestingModule,
  hostConfigs: HostConfig[],
): Promise<Host[]> {
  // @ts-ignore
  // Stripe account creation rate-limiting
  const hostsPerSecond = 3;
  const hostCreateTimeout = 1000 / hostsPerSecond;

  const hostPromises: Promise<Host>[] = [];

  hostConfigs.map(({ country, available, orderCount, verified }, index) =>
    setTimeout(
      () =>
        hostPromises.push(
          createTestHost(
            moduleRef,
            country,
            verified,
            available,
            true,
            orderCount,
          ).then(({ host }) => host),
        ),
      hostCreateTimeout * index,
    ),
  );

  await new Promise(res =>
    setTimeout(res, hostCreateTimeout * hostConfigs.length),
  );

  return Promise.all(hostPromises);
}
