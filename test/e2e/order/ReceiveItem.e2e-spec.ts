import { agent as requestAgent, Response } from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../../../src/AppModule';
import { Customer } from '../../../src/customer/entity/Customer';
import { ConfirmedOrder, Order } from '../../../src/order/entity/Order';
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
import { ReceiveItemRequest } from '../../../src/order/application/ReceiveItem/IReceiveItem';
import { IHostRepository } from '../../../src/host/persistence/IHostRepository';
import { Item } from '../../../src/order/entity/Item';

jest.setTimeout(30000);

describe('Receive Item – POST /order/receiveItem', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let agent: ReturnType<typeof requestAgent>;

  let customerRepository: ICustomerRepository;
  let hostRepository: IHostRepository;
  let orderRepository: IOrderRepository;

  let order: ConfirmedOrder;
  let receivedItem: Item;
  const originCountry: Country = originCountriesAvailable[0];

  let customer: Customer;

  let host: Host;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    setupNestApp(app);
    await app.init();

    customerRepository = await moduleRef.resolve(ICustomerRepository);
    hostRepository = await moduleRef.resolve(IHostRepository);
    orderRepository = await moduleRef.resolve(IOrderRepository);

    ({ customer } = await createTestCustomer(moduleRef, originCountry));
    ({ host } = await createTestHost(moduleRef, originCountry));

    order = await createConfirmedOrder(moduleRef, orderRepository, {
      customer,
      host,
      originCountry,
    });
  });

  afterAll(async () => {
    await Promise.all([
      hostRepository.deleteHost({ hostId: host.id }),
      customerRepository.deleteCustomer({ customerId: customer.id }),
      orderRepository.deleteOrder({ orderId: order.id }),
    ]);

    await app.close();
  });

  it('Marks Item as received', async () => {
    ({ agent } = await authorize(app, moduleRef, host.email, UserType.Host));

    receivedItem = order.items[0];
    const receiveItemRequest: ReceiveItemRequest = {
      orderId: order.id,
      itemId: receivedItem.id,
    };

    const response: Response = await agent
      .post('/order/receiveItem')
      .send(receiveItemRequest);

    type Await<T> = T extends PromiseLike<infer U> ? U : T;
    let logout: Await<ReturnType<typeof authorize>>['logout'];

    const newOrder: Order = await orderRepository.findOrder({
      orderId: order.id,
    });
    const newReceivedItem: Item = newOrder.items.find(
      ({ id }) => id === receivedItem.id,
    );

    expect(newReceivedItem.receivedDate).toBeDefined();
    expect(newReceivedItem.receivedDate).toBeInstanceOf(Date);
    expect(new Date(newReceivedItem.receivedDate)).toStrictEqual(
      new Date(response.body.receivedDate),
    );

    receivedItem = newReceivedItem;
  });

  it('Fails at repeated Item receipt', async () => {
    const receiveItemRequest: ReceiveItemRequest = {
      orderId: order.id,
      itemId: receivedItem.id,
    };

    const response: Response = await agent
      .post('/order/receiveItem')
      .send(receiveItemRequest);

    const {
      status,
      body: { message },
    } = response;

    expect(status).toBe(HttpStatus.NOT_ACCEPTABLE);
    expect(message).toMatch(/Item already marked as 'received'\./);

    const newOrder: Order = await orderRepository.findOrder({
      orderId: order.id,
    });
    const newReceivedItem: Item = newOrder.items.find(
      ({ id }) => id === receivedItem.id,
    );

    expect(newReceivedItem.receivedDate).toStrictEqual(
      receivedItem.receivedDate,
    );
  });
});
