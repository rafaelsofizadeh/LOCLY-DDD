import supertest from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { isUUID } from 'class-validator';

import { AppModule } from '../../../src/AppModule';
import { Customer } from '../../../src/customer/entity/Customer';
import { IOrderRepository } from '../../../src/order/persistence/IOrderRepository';
import { Address, UUID } from '../../../src/common/domain';
import { ICustomerRepository } from '../../../src/customer/persistence/ICustomerRepository';
import {
  DraftOrderPayload,
  DraftOrderRequest,
} from '../../../src/order/application/DraftOrder/IDraftOrder';
import { OrderStatus, DraftedOrder } from '../../../src/order/entity/Order';
import { Country } from '../../../src/order/entity/Country';
import {
  getDestinationCountriesAvailable,
  originCountriesAvailable,
} from '../../../src/calculator/data/PriceGuide';
import { setupNestApp } from '../../../src/main';
import { ICreateCustomer } from '../../../src/customer/application/CreateCustomer/ICreateCustomer';
import { IEditCustomer } from '../../../src/customer/application/EditCustomer/IEditCustomer';
import { IVerifyAuth } from '../../../src/auth/application/VerifyAuth/IVerifyAuth';
import { IRequestAuth } from '../../../src/auth/application/RequestAuth/IRequestAuth';
import { EntityType } from '../../../src/auth/entity/Token';

describe('[POST /order/draft] IDraftOrder', () => {
  let app: INestApplication;
  let request: ReturnType<typeof supertest.agent>;

  let requestAuthUseCase: IRequestAuth;
  let verifyAuthUseCase: IVerifyAuth;

  let createCustomerUseCase: ICreateCustomer;
  let editCustomerUseCase: IEditCustomer;

  let customerRepository: ICustomerRepository;
  let orderRepository: IOrderRepository;

  let testOrderId: UUID;
  let testCustomer: Customer;
  let testCustomerAddress: Address;

  const originCountry: Country = originCountriesAvailable[0];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    requestAuthUseCase = await moduleRef.resolve(IRequestAuth);
    verifyAuthUseCase = await moduleRef.resolve(IVerifyAuth);

    createCustomerUseCase = await moduleRef.resolve(ICreateCustomer);
    editCustomerUseCase = await moduleRef.resolve(IEditCustomer);

    customerRepository = await moduleRef.resolve(ICustomerRepository);
    orderRepository = await moduleRef.resolve(IOrderRepository);

    app = moduleRef.createNestApplication();
    await setupNestApp(app);
    await app.init();

    request = supertest.agent(app.getHttpServer());

    testCustomerAddress = {
      addressLine1: '10 Bandz',
      locality: 'Juicy',
      country: getDestinationCountriesAvailable(originCountry)[0],
    };

    testCustomer = await createCustomerUseCase.execute({
      port: {
        email: 'random@email.com',
      },
    });

    await editCustomerUseCase.execute({
      port: {
        customerId: testCustomer.id,
        addresses: [testCustomerAddress],
      },
    });

    testCustomer.addresses.push(testCustomerAddress);

    const authTokenString = await requestAuthUseCase.execute({
      port: { email: testCustomer.email, type: EntityType.Customer },
    });
    await request.get(`/auth/${authTokenString}`);
  });

  afterAll(async () => {
    await app.close();
  });

  describe.only('interact with DB and require invididual teardown', () => {
    afterAll(() =>
      Promise.all([
        customerRepository.deleteCustomer({ customerId: testCustomer.id }),
        orderRepository.deleteOrder({ orderId: testOrderId }),
      ]),
    );

    it.only('successfully creates a Order', async () => {
      const testOrderRequest: DraftOrderRequest = {
        originCountry: originCountriesAvailable[0],
        destination: testCustomerAddress,
        items: [
          {
            title: 'Laptop',
            storeName: 'Amazon',
            weight: 1500,
          },
        ],
      };

      const response: supertest.Response = await request
        .post('/order')
        .send(testOrderRequest);

      console.log(response.body);

      expect(response.status).toBe(HttpStatus.CREATED);

      const { id, customerId, destination } = response.body as DraftedOrder;

      // 1. order id should be a UUID
      expect(isUUID(id)).toBe(true);

      testOrderId = UUID(id);

      // 2. order should be added to the db and its status should be OrderStatus.Drafted and the resulting Order object
      // should be a DraftedOrder
      const addedOrder: DraftedOrder = (await orderRepository.findOrder(
        {
          orderId: testOrderId,
          status: OrderStatus.Drafted,
          customerId: testCustomer.id,
        },
        undefined,
        false,
      )) as DraftedOrder;

      console.log(
        {
          orderId: testOrderId,
          status: OrderStatus.Drafted,
          customerId: testCustomer.id,
        },
        addedOrder,
      );
      expect(addedOrder.status).toBe(OrderStatus.Drafted);

      // Load the test customer from the database
      const updatedTestCustomer: Customer = await customerRepository.findCustomer(
        { customerId: testCustomer.id },
      );

      // 3. order customerId should be the same as customer id
      expect(customerId).toEqual(updatedTestCustomer.id);
      // 4. order id should be added to customer orderIds (i.e. order is assigned to customer)
      expect(updatedTestCustomer.orderIds).toContain(testOrderId);
      // 5. customer's address should be set on the order
      expect(destination).toEqual(testCustomerAddress);
    });
  });

  describe("API-side tests, don't interact with DB, don't require individual teardown", () => {
    it('fails on invalid request format #1', async () => {
      const invalidTestOrderRequest = {};

      const response: supertest.Response = await request
        .post('/order')
        .send(invalidTestOrderRequest);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual([
        'customerId must be an UUID',
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

      const response: supertest.Response = await request
        .post('/order')
        .send(invalidTestOrderRequest);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual([
        'customerId must be an UUID',
        'originCountry must be a valid ISO31661 Alpha3 code',
        'destination should not be null or undefined',
        'destination must be a non-empty object',
        'items.0.weight must be a positive number',
        'items.0.weight must be an integer number',
      ]);
    });

    it('fails due to unavailable service in country', async () => {
      // TODO: [allCountries - originCountry].chooseRandom()
      const unavailableOriginCountry: Country = 'ITA';

      const testOrderRequest: DraftOrderPayload = {
        customerId: testCustomer.id,
        originCountry: unavailableOriginCountry,
        destination: testCustomerAddress,
        items: [
          {
            title: 'Laptop',
            storeName: 'Amazon',
            weight: 1500,
          },
        ],
      };

      const response: supertest.Response = await request
        .post('/order')
        .send(testOrderRequest);

      // HTTP 503 'SERVICE UNAVAILABLE'
      expect(response.status).toBe(HttpStatus.SERVICE_UNAVAILABLE);

      // TODO: Error typing
      const { message, data } = response.body;

      // TODO: Better way to check error message
      // 1. Check the error format
      expect(message.split(':')[0]).toBe(
        `SERVICE_UNAVAILABLE | Origin country ${unavailableOriginCountry} is not supported by the calculator. `,
      );
    });

    it('fails on nonexistent customer', async () => {
      const nonexistentCustomerId: UUID = UUID();

      const invalidTestOrderRequest: DraftOrderPayload = {
        customerId: nonexistentCustomerId,
        originCountry: originCountriesAvailable[0],
        destination: testCustomerAddress,
        items: [
          {
            title: 'Laptop',
            storeName: 'Amazon',
            weight: 1500,
          },
        ],
      };

      const response: supertest.Response = await request
        .post('/order')
        .send(invalidTestOrderRequest);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);

      expect(response.body.message).toMatch(
        // TODO: Remove necessity for the entire string (toMatch apparently doesn't work with non-exact matches)
        new RegExp(
          `${
            HttpStatus[HttpStatus.NOT_FOUND]
          } | Order couldn't be added to customer \(orderId: [a-zA-Z0-9-]+, customerId: ${nonexistentCustomerId}\): customer with given id doesn't exist`,
        ),
      );
    });

    /**
     * TODO: Test for transaction rollback success.
     *
     * 1. Count the number of documents in collection
     * 2. IDraftOrder -> failure
     * 3. Count the number of documents in collection again. 3 === 1, else failure
     *
     * You can either knowingly make the UseCase fail (like in 'fails on nonexistent customer'),
     * or mock a function to __always__ fail. But how to mock the function, for example, addOrder?
     *
     * TODO: Test for all granular calculator errors
     */
  });
});
