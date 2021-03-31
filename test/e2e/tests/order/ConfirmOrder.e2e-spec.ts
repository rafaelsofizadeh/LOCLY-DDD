import { readFile, writeFile } from 'fs';
import * as path from 'path';
import * as supertest from 'supertest';
import * as MUUID from 'uuid-mongodb';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '../../../../src/AppModule';
import { Customer } from '../../../../src/order/domain/entity/Customer';
import { Order } from '../../../../src/order/domain/entity/Order';
import { Host } from '../../../../src/order/domain/entity/Host';
import { Address } from '../../../../src/order/domain/entity/Address';

import {
  destinationCountriesAvailable,
  originCountriesAvailable,
} from '../../../../src/order/application/services/HostMatcherService';
import { CustomerRepository } from '../../../../src/order/application/port/CustomerRepository';
import { OrderRepository } from '../../../../src/order/application/port/OrderRepository';
import { muuidToEntityId } from '../../../../src/common/utils';
import { CreateOrderUseCase } from '../../../../src/order/domain/use-case/CreateOrderUseCase';
import { Category, Item } from '../../../../src/order/domain/entity/Item';
import { Country } from '../../../../src/order/domain/data/Country';
import { isString } from 'class-validator';
import {
  Match,
  MatchCache,
} from '../../../../src/order/application/port/MatchCache';
import { HostRepository } from '../../../../src/order/application/port/HostRepository';

describe('Confirm Order – POST /order/confirm', () => {
  let app: INestApplication;

  let customerRepository: CustomerRepository;
  let orderRepository: OrderRepository;
  let hostRepository: HostRepository;
  let matchCache: MatchCache;

  let createOrderUseCase: CreateOrderUseCase;

  let testCustomer: Customer;
  let testOrder: Order;
  let testHosts: Host[];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    customerRepository = (await moduleRef.resolve(
      CustomerRepository,
    )) as CustomerRepository;

    orderRepository = (await moduleRef.resolve(
      OrderRepository,
    )) as OrderRepository;

    hostRepository = (await moduleRef.resolve(
      HostRepository,
    )) as HostRepository;

    matchCache = (await moduleRef.resolve(MatchCache)) as MatchCache;

    createOrderUseCase = (await moduleRef.resolve(
      CreateOrderUseCase,
    )) as CreateOrderUseCase;
  });

  beforeEach(async () => {
    const originCountry: Country = originCountriesAvailable[0];
    const destinationCountry: Country = destinationCountriesAvailable[0];

    testCustomer = new Customer({
      selectedAddress: new Address({
        country: destinationCountry,
      }),
      orderIds: [],
    });

    const testHostConfigs: Array<{
      country: Country;
      available: boolean;
      orderCount: number;
    }> = [
      /*
      Test host #1:
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

    testHosts = testHostConfigs.map(
      ({ country, available, orderCount }) =>
        new Host({
          address: new Address({ country }),
          available,
          orderIds: [...Array(orderCount)].map(_ =>
            muuidToEntityId(MUUID.v4()),
          ),
        }),
    );

    await Promise.all([
      customerRepository.addCustomer(testCustomer),
      hostRepository.addManyHosts(testHosts),
    ]);

    testOrder = await createOrderUseCase.execute({
      customerId: testCustomer.id,
      // TODO: Item fixture
      items: [
        new Item({
          title: 'Laptop',
          storeName: 'Amazon',
          width: 100,
          height: 100,
          length: 100,
          weight: 10,
          category: Category.Electronics,
        }),
      ],
      originCountry,
    });
  });

  // IMPORTANT: ALWAYS clean up the database after commenting out the cleanup in afterEach
  // (usually done for testing purposes)
  afterEach(() =>
    // TODO: Hosts and orders don't get deleted
    Promise.all([
      customerRepository.deleteCustomer(testCustomer.id),
      hostRepository.deleteManyHosts(testHosts.map(({ id }) => id)),
      // TODO (FUTURE): Delete through deleteOrderUseCase
      orderRepository.deleteOrder(testOrder.id),
    ]),
  );

  it('Matches Order with a Host, updates Order\'s "hostId" property, and Host\'s "orderIds" property', async () => {
    const response: supertest.Response = await supertest(app.getHttpServer())
      .post('/order/confirm')
      .send({
        orderId: testOrder.id.value,
      });

    console.log('testHosts', testHosts);
    console.log('testOrder', testOrder);

    expect(response.status).toBe(201);

    // TODO: strong typing
    const { checkoutId }: { checkoutId: string } = response.body;

    expect(checkoutId).toBeDefined();
    expect(isString(checkoutId)).toBe(true);
    expect(checkoutId.slice(0, 2)).toBe('cs'); // "Checkout Session"

    const match: Match = await matchCache.findMatch(
      testOrder.id,
      // testOrder SHOULD be matched with the first testHost
      testHosts[0].id,
    );

    expect(match).toBeDefined();

    updatedStripeCheckoutSessionInTestPage(checkoutId);
  });
});

function updatedStripeCheckoutSessionInTestPage(checkoutId: string) {
  const checkoutPagePath = path.join(__dirname, './CheckoutPage.html');

  readFile(checkoutPagePath, 'utf8', (error, data) => {
    if (error) {
      console.log(error);
    }

    const updatedStripeCheckoutSessionFileContent = data.replace(
      /cs_test_[\w\d]+/g,
      checkoutId,
    );

    writeFile(
      checkoutPagePath,
      updatedStripeCheckoutSessionFileContent,
      'utf8',
      error => {
        if (error) {
          console.log(error);
        }
      },
    );
  });
}

/*const {
      status,
      hostId,
    }: { status: OrderStatus; hostId: string } = response.body;

    expect(status).toBe(OrderStatus.Confirmed);
    expect(hostId).toBe(testHosts[0].id.value);

    const updatedTestHost: Host = await hostRepository.findHost(
      new EntityId(hostId),
    );

    console.log('updatedTestHost', updatedTestHost);

    expect(updatedTestHost.orderIds.map(({ value }) => value)).toContain(
      testOrder.id.value,
    );*/
