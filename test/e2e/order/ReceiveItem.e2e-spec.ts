import { agent as requestAgent, Response } from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../../../src/AppModule';
import { Customer } from '../../../src/customer/entity/Customer';
import { IDraftOrder } from '../../../src/order/application/DraftOrder/IDraftOrder';
import { Order } from '../../../src/order/entity/Order';
import { Country } from '../../../src/order/entity/Country';
import { originCountriesAvailable } from '../../../src/calculator/data/PriceGuide';
import { setupNestApp } from '../../../src/main';
import { UserType } from '../../../src/auth/entity/Token';
import { authorize, createTestCustomer, createTestHost } from '../utilities';
import { IGetOrder } from '../../../src/order/application/GetOrder/IGetOrder';
import { IDeleteOrder } from '../../../src/order/application/DeleteOrder/IDeleteOrder';
import { ICustomerRepository } from '../../../src/customer/persistence/ICustomerRepository';
import { IOrderRepository } from '../../../src/order/persistence/IOrderRepository';
import { Host } from '../../../src/host/entity/Host';
import { IConfirmOrderHandler } from '../../../src/order/application/StripeCheckoutWebhook/handlers/ConfirmOrderHandler/IConfirmOrderHandler';
import { IConfirmOrder } from '../../../src/order/application/ConfirmOrder/IConfirmOrder';
import { ReceiveItemRequest } from '../../../src/order/application/ReceiveItem/IReceiveItem';
import { IHostRepository } from '../../../src/host/persistence/IHostRepository';
import { Item } from '../../../src/order/entity/Item';

/**
 * 1. Create test Customer
 * 2. Create test Host
 * 3. Authorize as Customer
 * 4. Execute DraftOrder
 * 5. Confirm order:
 *    1. Execute ConfirmOrder
 *    2. Trigger ConfirmOrderHandler (webhook)
 * 6. Logout
 * 7. Authorize as Host
 * 8. Execute ReceiveItem
 */

describe('[POST /order/draft] IDraftOrder', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let agent: ReturnType<typeof requestAgent>;

  let customerRepository: ICustomerRepository;
  let hostRepository: IHostRepository;
  let orderRepository: IOrderRepository;

  let order: Order;
  let getOrder: IGetOrder;
  let deleteOrder: IDeleteOrder;

  let receivedItem: Item;

  let customer: Customer;

  let host: Host;

  const originCountry: Country = originCountriesAvailable[0];

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

    ({ customer } = await createTestCustomer(moduleRef, originCountry));
    ({ host } = await createTestHost(moduleRef, originCountry));

    getOrder = await moduleRef.resolve(IGetOrder);
    const draftOrder: IDraftOrder = await moduleRef.resolve(IDraftOrder);
    const confirmOrder: IConfirmOrder = await moduleRef.resolve(IConfirmOrder);
    const confirmOrderWebhookHandler: IConfirmOrderHandler = await moduleRef.resolve(
      IConfirmOrderHandler,
    );

    const { id: orderId } = await draftOrder.execute({
      port: {
        customerId: customer.id,
        originCountry,
        destination: customer.addresses[0],
        items: [
          {
            title: 'Item #1',
            storeName: 'Random Store',
            weight: 700,
          },
          {
            title: 'Item #2',
            storeName: 'Randomer Store',
            weight: 300,
          },
        ],
      },
    });

    await confirmOrder.execute({
      port: { orderId, customerId: customer.id },
    });

    await confirmOrderWebhookHandler.execute({
      port: { orderId, hostId: host.id },
    });

    order = await orderRepository.findOrder({ orderId });
  });

  afterAll(async () => {
    await Promise.all([
      hostRepository.deleteHost({ hostId: host.id }),
      customerRepository.deleteCustomer({ customerId: customer.id }),
      //orderRepository.deleteOrder({ orderId: order.id }),
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
    expect(message).toMatch(/Item already marked as "received"\./);

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
