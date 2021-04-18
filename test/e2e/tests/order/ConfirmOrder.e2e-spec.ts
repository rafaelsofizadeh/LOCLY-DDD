import { readFile, writeFile } from 'fs';
import * as path from 'path';
import * as supertest from 'supertest';
import * as MUUID from 'uuid-mongodb';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '../../../../src/AppModule';
import { Customer } from '../../../../src/order/domain/entity/Customer';
import { Host } from '../../../../src/order/domain/entity/Host';
import { Address } from '../../../../src/order/domain/entity/Address';

import { CustomerRepository } from '../../../../src/order/application/port/CustomerRepository';
import { OrderRepository } from '../../../../src/order/application/port/OrderRepository';
import { muuidToUuid } from '../../../../src/common/utils';
import { DraftOrderUseCase } from '../../../../src/order/domain/use-case/DraftOrderUseCase';
import { Category, Item } from '../../../../src/order/domain/entity/Item';
import { Country } from '../../../../src/order/domain/data/Country';
import { isString } from 'class-validator';
import {
  Match,
  MatchRecorder,
} from '../../../../src/order/application/port/MatchRecorder';
import { HostRepository } from '../../../../src/order/application/port/HostRepository';
import { DraftedOrder } from '../../../../src/order/domain/entity/DraftedOrder';
import {
  destinationCountriesAvailable,
  originCountriesAvailable,
} from '../../../../src/order/application/services/checkServiceAvailability';

describe('Confirm Order – POST /order/confirm', () => {
  let app: INestApplication;

  let customerRepository: CustomerRepository;
  let orderRepository: OrderRepository;
  let hostRepository: HostRepository;
  let matchRecorder: MatchRecorder;

  let draftOrderUseCase: DraftOrderUseCase;

  let testCustomer: Customer;
  let testOrder: DraftedOrder;
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

    matchRecorder = (await moduleRef.resolve(MatchRecorder)) as MatchRecorder;

    draftOrderUseCase = (await moduleRef.resolve(
      DraftOrderUseCase,
    )) as DraftOrderUseCase;
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
          orderIds: [...Array(orderCount)].map(_ => muuidToUuid(MUUID.v4())),
        }),
    );

    // TODO(?): Promise.all()'ing this leads to an ERROR. Apparently a write conflict between
    // 1. customerRepository.addCustomer (insert)
    // 2. draftOrderUseCase.execute > customerRepository.addOrderToCustomer (update)
    await hostRepository.addManyHosts(testHosts);
    await customerRepository.addCustomer(testCustomer);

    testOrder = await draftOrderUseCase.execute({
      customerId: testCustomer.id,
      originCountry,
      destination: testCustomer.selectedAddress,
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
    });
  });

  // IMPORTANT: ALWAYS clean up the database after commenting out the cleanup in afterEach
  // (usually done for testing purposes)
  afterEach(() =>
    Promise.all([
      customerRepository.deleteCustomer(testCustomer.id),
      hostRepository.deleteManyHosts(testHosts.map(({ id }) => id)),
      // TODO (FUTURE): Delete through deleteOrderUseCase
      orderRepository.deleteOrder(testOrder.id),
      // TODO: Clean up Match
    ]),
  );

  it('Matches Order with a Host, updates Order\'s "hostId" property, and Host\'s "orderIds" property', async () => {
    const response: supertest.Response = await supertest(app.getHttpServer())
      .post('/order/confirm')
      .send({
        orderId: testOrder.id,
      });

    expect(response.status).toBe(201);

    // TODO: strong typing
    const { checkoutId }: { checkoutId: string } = response.body;

    expect(checkoutId).toBeDefined();
    expect(isString(checkoutId)).toBe(true);
    expect(checkoutId.slice(0, 2)).toBe('cs'); // "Checkout Session"

    const match: Match = await matchRecorder.findMatch(
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
    expect(hostId).toBe(testHosts[0].id);

    const updatedTestHost: Host = await hostRepository.findHost(
      UUID(hostId),
    );

    console.log('updatedTestHost', updatedTestHost);

    expect(updatedTestHost.orderIds.toContain(
      testOrder.id,
    );*/
