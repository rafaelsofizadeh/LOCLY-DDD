import supertest, { agent as requestAgent } from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';

import { AppModule } from '../../../src/AppModule';
import { Customer } from '../../../src/customer/entity/Customer';
import { Order, OrderStatus } from '../../../src/order/entity/Order';
import { Country } from '../../../src/order/entity/Country';
import { originCountriesAvailable } from '../../../src/calculator/data/PriceGuide';
import { setupNestApp } from '../../../src/main';
import { UserType } from '../../../src/auth/entity/Token';
import {
  authorize,
  createConfirmedOrder,
  createTestCustomer,
  createTestHost,
} from '../utilities';
import { ICustomerRepository } from '../../../src/customer/persistence/ICustomerRepository';
import { IOrderRepository } from '../../../src/order/persistence/IOrderRepository';
import { Host } from '../../../src/host/entity/Host';
import { IReceiveItem } from '../../../src/order/application/ReceiveItem/IReceiveItem';
import { IHostRepository } from '../../../src/host/persistence/IHostRepository';

describe('[POST /order/draft] IDraftOrder', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let agent: ReturnType<typeof requestAgent>;

  let customerRepository: ICustomerRepository;
  let hostRepository: IHostRepository;
  let orderRepository: IOrderRepository;

  let receiveItem: IReceiveItem;

  let order: Order;
  const originCountry: Country = originCountriesAvailable[0];

  let customer: Customer;

  let host: Host;

  beforeAll(async () => {
    jest.setTimeout(30000);

    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await setupNestApp(app);
    await app.init();

    customerRepository = await moduleRef.resolve(ICustomerRepository);
    hostRepository = await moduleRef.resolve(IHostRepository);
    orderRepository = await moduleRef.resolve(IOrderRepository);

    receiveItem = await moduleRef.resolve(IReceiveItem);

    ({ customer } = await createTestCustomer(moduleRef, originCountry));
    ({ host } = await createTestHost(moduleRef, originCountry));

    ({ agent } = await authorize(app, moduleRef, host.email, UserType.Host));
  });

  const itemCountTestCases = [[1], [2]];

  async function beforeEachTest(
    itemCount: number,
    receivedCount: number = itemCount,
  ) {
    order = await createConfirmedOrder(moduleRef, orderRepository, {
      customer,
      host,
      originCountry,
      itemCount,
    });

    // slice(0, receivedCount) === [0, ..., receivedCount - 1]
    for (const receivedItem of order.items.slice(0, receivedCount)) {
      await receiveItem.execute({
        port: {
          orderId: order.id,
          itemId: receivedItem.id,
          hostId: host.id,
        },
      });

      order = await orderRepository.findOrder({
        orderId: order.id,
      });

      await agent
        .post('/order/itemPhotos')
        .field('orderId', order.id)
        .field('itemId', receivedItem.id)
        .attach('photos', join(__dirname, './addItemPhotos-test-image.png'));
    }
  }

  afterEach(
    async () =>
      await Promise.all([orderRepository.deleteOrder({ orderId: order.id })]),
  );

  afterAll(async () => {
    await Promise.all([
      hostRepository.deleteHost({ hostId: host.id }),
      customerRepository.deleteCustomer({ customerId: customer.id }),
    ]);

    await app.close();
  });

  it.each(itemCountTestCases)(
    'Successful (%i item(s) received and photographed)',
    async itemCount => {
      await beforeEachTest(itemCount);

      const requestPayload = {
        orderId: order.id,
        totalWeight: 2000,
        shipmentCost: {
          amount: 100,
          currency: 'USD',
        },
        calculatorResultUrl: 'news.ycombinator.com',
      };

      const response: supertest.Response = await agent
        .post('/order/shipmentInfo')
        .send(requestPayload);

      expect(response.status).toBe(HttpStatus.CREATED);

      const updatedOrder: Order = await orderRepository.findOrder({
        orderId: order.id,
      });

      const {
        orderId: matchOrderId,
        shipmentCost: finalShipmentCost,
        ...restMatch
      } = requestPayload;

      expect(updatedOrder).toMatchObject({
        ...restMatch,
        finalShipmentCost,
        id: matchOrderId,
      });
    },
  );

  it.each(itemCountTestCases)(
    'Fail (%i item(s) received but not all photographed)',
    async function(itemCount) {
      await beforeEachTest(itemCount, itemCount - 1);

      const requestPayload = {
        orderId: order.id,
        totalWeight: 2000,
        shipmentCost: {
          amount: 100,
          currency: 'USD',
        },
        calculatorResultUrl: 'news.ycombinator.com',
      };

      const response: supertest.Response = await agent
        .post('/order/shipmentInfo')
        .send(requestPayload);

      // beforeEachTest -> receivedCount passed: itemCount - 1 => 1 item will not be received
      expect(response.body.data.unfinalizedItems.length).toBe(1);
      expect(response.status).toBe(HttpStatus.FORBIDDEN);

      const updatedOrder: Order = await orderRepository.findOrder({
        orderId: order.id,
      });

      expect(updatedOrder.status).toBe(OrderStatus.Confirmed);
      expect(updatedOrder.finalShipmentCost).toBeUndefined();
      expect(updatedOrder.totalWeight).toBeUndefined();
      expect(updatedOrder.calculatorResultUrl).toBeUndefined();
    },
  );
});
