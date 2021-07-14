import supertest from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getCollectionToken } from 'nest-mongodb';
import { isUUID } from 'class-validator';

import countries from '../../../src/calculator/data/CountryIsoCodes';
import { AppModule } from '../../../src/AppModule';
import { Customer } from '../../../src/customer/entity/Customer';
import { serializeMongoData } from '../../../src/common/persistence';
import { Address, UUID } from '../../../src/common/domain';
import {
  DraftOrderPayload,
  DraftOrderRequest,
  IDraftOrder,
} from '../../../src/order/application/DraftOrder/IDraftOrder';
import {
  OrderStatus,
  DraftedOrder,
  Order,
} from '../../../src/order/entity/Order';
import { Country } from '../../../src/order/entity/Country';
import { originCountriesAvailable } from '../../../src/calculator/data/PriceGuide';
import { setupNestApp } from '../../../src/main';
import { UserType } from '../../../src/auth/entity/Token';
import { authorize, createTestCustomer } from '../utilities';
import { IGetOrder } from '../../../src/order/application/GetOrder/IGetOrder';
import { IDeleteOrder } from '../../../src/order/application/DeleteOrder/IDeleteOrder';
import { ICustomerRepository } from '../../../src/customer/persistence/ICustomerRepository';
import { throwCustomException } from '../../../src/common/error-handling';
import { IOrderRepository } from '../../../src/order/persistence/IOrderRepository';
import { Collection } from 'mongodb';
import { OrderMongoDocument } from '../../../src/order/persistence/OrderMongoMapper';

describe('Draft Order – POST /order', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let agent: ReturnType<typeof supertest.agent>;

  let customerRepository: ICustomerRepository;
  let orderRepository: IOrderRepository;

  let getOrder: IGetOrder;
  let draftOrder: IDraftOrder;
  let deleteOrder: IDeleteOrder;

  let customer: Customer;
  let address: Address;

  let orderId: UUID;
  const originCountry: Country = originCountriesAvailable[0];

  beforeAll(async () => {
    jest.setTimeout(20000);

    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await setupNestApp(app);
    await app.init();

    customerRepository = await moduleRef.resolve(ICustomerRepository);
    orderRepository = await moduleRef.resolve(IOrderRepository);

    ({ customer } = await createTestCustomer(moduleRef, originCountry));
    address = customer.addresses[0];

    ({ agent } = await authorize(
      app,
      moduleRef,
      customer.email,
      UserType.Customer,
    ));

    getOrder = await moduleRef.resolve(IGetOrder);
    draftOrder = await moduleRef.resolve(IDraftOrder);
    deleteOrder = await moduleRef.resolve(IDeleteOrder);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('interact with DB, require invididual teardown', () => {
    afterAll(() =>
      Promise.all([
        orderRepository.deleteOrder({ orderId }),
        customerRepository.deleteCustomer({ customerId: customer.id }),
      ]),
    );

    it('creates a Order', async () => {
      const testOrderRequest: DraftOrderRequest = {
        originCountry,
        destination: address,
        items: [
          {
            title: 'Laptop',
            storeName: 'Amazon',
            weight: 1500,
          },
        ],
      };

      const response: supertest.Response = await agent
        .post('/order')
        .send(testOrderRequest);

      expect(response.status).toBe(HttpStatus.CREATED);

      const { id, customerId, destination } = response.body as DraftedOrder;

      // Order id should be a UUID
      expect(isUUID(id)).toBe(true);

      orderId = UUID(id);

      // Order should be added to the db and its status should be OrderStatus.Drafted and the resulting Order object
      // should be a DraftedOrder
      const addedOrder: Order = await getOrder.execute({
        port: { orderId, userId: customer.id, userType: UserType.Customer },
      });

      // Order should have a 'Drafted' status
      expect(addedOrder.status).toBe(OrderStatus.Drafted);
      // Order should be assigned its customer's id.
      expect(addedOrder.customerId).toBe(customer.id);

      // Load the updated customer from the database
      const updatedCustomer: Customer = await customerRepository.findCustomer({
        customerId: customer.id,
      });

      // Order customerId should be the same as customer id
      expect(customerId).toEqual(updatedCustomer.id);
      // Order id should be added to customer orderIds (i.e. order is assigned to customer)
      expect(updatedCustomer.orderIds).toContain(orderId);
      // Customer's address should be set on the order
      expect(destination).toEqual(address);
    });

    it('transaction rollback on uncaught exceptions', async () => {
      const orderCollection: Collection<OrderMongoDocument> = await moduleRef.resolve(
        getCollectionToken('orders'),
      );

      const addOrder = customerRepository.addOrder.bind(customerRepository);
      const testException = 'TEST EXCEPTION';
      jest
        .spyOn(customerRepository, 'addOrder')
        .mockImplementationOnce(async (...args: any[]) => {
          addOrder(...args);
          throwCustomException(testException)();
        });

      const getAllOrders = (): Promise<Order[]> =>
        orderCollection
          .find()
          .toArray()
          .then(orderDocuments =>
            orderDocuments.map(orderDocument =>
              serializeMongoData(orderDocument),
            ),
          );

      const beforeOrderDatabaseSnapshot: Order[] = await getAllOrders();
      const beforeCustomer: Customer = await customerRepository.findCustomer({
        customerId: customer.id,
      });

      const testOrderRequest: DraftOrderRequest = {
        originCountry,
        destination: address,
        items: [
          {
            title: 'Laptop',
            storeName: 'Amazon',
            weight: 1500,
          },
        ],
      };

      const response: supertest.Response = await agent
        .post('/order')
        .send(testOrderRequest);

      expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      const { message } = response.body;
      expect(message).toMatch(testException);

      const afterOrderDatabaseSnapshot: Order[] = await getAllOrders();
      const afterCustomer: Customer = await customerRepository.findCustomer({
        customerId: customer.id,
      });

      expect(afterOrderDatabaseSnapshot).toEqual(beforeOrderDatabaseSnapshot);
      expect(afterCustomer).toEqual(beforeCustomer);
    });
  });

  describe("API-side tests, don't interact with DB, don't require individual teardown", () => {
    it('fails on invalid request format #1', async () => {
      const invalidTestOrderRequest = {};

      const response: supertest.Response = await agent
        .post('/order')
        .send(invalidTestOrderRequest);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual([
        'originCountry must be a valid ISO31661 Alpha3 code',
        'destination should not be null or undefined',
        'destination must be a non-empty object',
        'items must be an array',
        'items must contain at least 1 elements',
      ]);
    });

    it('fails on invalid request format #2', async () => {
      const invalidTestOrderRequest = {
        items: [
          {
            title: 'some passing title',
            storeName: 'some passing storeName',
          },
        ],
      };

      const response: supertest.Response = await agent
        .post('/order')
        .send(invalidTestOrderRequest);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual([
        'originCountry must be a valid ISO31661 Alpha3 code',
        'destination should not be null or undefined',
        'destination must be a non-empty object',
        'items.0.weight must be a positive number',
        'items.0.weight must be an integer number',
      ]);
    });

    it('fails due to unavailable service in country', async () => {
      const unavailableOriginCountry: Country = countries.find(
        (country: Country) => !originCountriesAvailable.includes(country),
      ) as Country;

      const testOrderRequest: DraftOrderRequest = {
        originCountry: unavailableOriginCountry,
        destination: address,
        items: [
          {
            title: 'Laptop',
            storeName: 'Amazon',
            weight: 1500,
          },
        ],
      };

      const response: supertest.Response = await agent
        .post('/order')
        .send(testOrderRequest);

      // HTTP 503 'SERVICE UNAVAILABLE'
      expect(response.status).toBe(HttpStatus.SERVICE_UNAVAILABLE);

      const { message, data } = response.body;

      // Check the error format
      expect(message.split(':')[0]).toBe(
        `SERVICE_UNAVAILABLE | Origin country ${unavailableOriginCountry} is not supported by the calculator. `,
      );
    });

    it('fails on nonexistent customer', async () => {
      const nonexistentCustomerId: UUID = UUID();

      const invalidTestOrderRequest: DraftOrderPayload = {
        customerId: nonexistentCustomerId,
        originCountry,
        destination: address,
        items: [
          {
            title: 'Laptop',
            storeName: 'Amazon',
            weight: 1500,
          },
        ],
      };

      try {
        await draftOrder.execute({ port: invalidTestOrderRequest });
      } catch (error) {
        expect(error.error.message).toMatch(
          'less than 1 customer with given requirements',
        );
      }
    });

    // TODO: Test for all granular calculator errors
  });
});
