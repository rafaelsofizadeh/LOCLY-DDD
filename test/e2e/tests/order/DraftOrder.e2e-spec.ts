import * as supertest from 'supertest';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { isUUID } from 'class-validator';

import { AppModule } from '../../../../src/AppModule';
import { Customer } from '../../../../src/customer/entity/Customer';
import { IOrderRepository } from '../../../../src/order/persistence/IOrderRepository';
import { UUID } from '../../../../src/common/domain';
import { ICustomerRepository } from '../../../../src/customer/persistence/ICustomerRepository';
import { DraftOrderRequest } from '../../../../src/order/application/DraftOrder/IDraftOrder';
import { OrderStatus, DraftedOrder } from '../../../../src/order/entity/Order';
import { Country } from '../../../../src/order/entity/Country';
import { CustomExceptionFilter } from '../../../../src/infrastructure/CustomExceptionFilter';
import {
  getDestinationCountriesAvailable,
  originCountriesAvailable,
} from '../../../../src/calculator/data/PriceGuide';

// TODO(GLOBAL)(TESTING): Substitute database name in tests

describe('[POST /order/draft] IDraftOrder', () => {
  let app: INestApplication;

  let customerRepository: ICustomerRepository;
  let orderRepository: IOrderRepository;

  let testOrderId: UUID;
  let testCustomer: Customer;

  const originCountry = originCountriesAvailable[0];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // TODO: To prevent having to manually register all global pipes, interceptors and etc., create a single method
    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new CustomExceptionFilter());

    await app.init();

    customerRepository = (await moduleRef.resolve(
      ICustomerRepository,
    )) as ICustomerRepository;

    orderRepository = (await moduleRef.resolve(
      IOrderRepository,
    )) as IOrderRepository;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('interact with DB and require invididual teardown', () => {
    beforeEach(async () => {
      testCustomer = {
        id: UUID(),
        selectedAddress: {
          country: getDestinationCountriesAvailable(originCountry)[0],
        },
        orderIds: [],
      };

      await customerRepository.addCustomer(testCustomer);
    });

    afterEach(() =>
      Promise.all([
        customerRepository.deleteCustomer({ customerId: testCustomer.id }),
        orderRepository.deleteOrder({ orderId: testOrderId }),
      ]),
    );

    it('successfully creates a Order', async () => {
      const testOrderRequest: DraftOrderRequest = {
        customerId: testCustomer.id,
        originCountry: originCountriesAvailable[0],
        destination: testCustomer.selectedAddress,
        items: [
          {
            title: 'Laptop',
            storeName: 'Amazon',
            weight: 1500,
          },
        ],
      };

      const response: supertest.Response = await supertest(app.getHttpServer())
        .post('/order/draft')
        .send(testOrderRequest);

      expect(response.status).toBe(HttpStatus.CREATED);

      const { id, customerId, destination } = response.body as DraftedOrder;

      // 1. order id should be a UUID
      expect(isUUID(id)).toBe(true);

      testOrderId = UUID(id);

      // 2. order should be added to the db and its status should be OrderStatus.Drafted and the resulting Order object
      // should be a DraftedOrder
      await expect(
        orderRepository.findOrder({
          orderId: testOrderId,
          status: OrderStatus.Drafted,
          customerId: testCustomer.id,
        }),
      ).resolves.toHaveProperty('status', OrderStatus.Drafted);

      // Load the test customer from the database
      const updatedTestCustomer: Customer = await customerRepository.findCustomer(
        { customerId: testCustomer.id },
      );

      // 3. order customerId should be the same as customer id
      expect(customerId).toEqual(updatedTestCustomer.id);
      // 4. order id should be added to customer orderIds (i.e. order is assigned to customer)
      expect(updatedTestCustomer.orderIds).toContain(testOrderId);
      // 5. customer.selectedAddress should be set on the order
      expect(destination).toEqual(testCustomer.selectedAddress);
    });
  });

  describe("API-side tests, don't interact with DB, don't require individual teardown", () => {
    it('fails on invalid request format #1', async () => {
      const invalidTestOrderRequest = {};

      const response: supertest.Response = await supertest(app.getHttpServer())
        .post('/order/draft')
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

      const response: supertest.Response = await supertest(app.getHttpServer())
        .post('/order/draft')
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

      const testOrderRequest: DraftOrderRequest = {
        customerId: testCustomer.id,
        originCountry: unavailableOriginCountry,
        destination: testCustomer.selectedAddress,
        items: [
          {
            title: 'Laptop',
            storeName: 'Amazon',
            weight: 1500,
          },
        ],
      };

      const response: supertest.Response = await supertest(app.getHttpServer())
        .post('/order/draft')
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

      const invalidTestOrderRequest: DraftOrderRequest = {
        customerId: nonexistentCustomerId,
        originCountry: originCountriesAvailable[0],
        destination: testCustomer.selectedAddress,
        items: [
          {
            title: 'Laptop',
            storeName: 'Amazon',
            weight: 1500,
          },
        ],
      };

      const response: supertest.Response = await supertest(app.getHttpServer())
        .post('/order/draft')
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
     * or mock a function to __always__ fail. But how to mock the function, for example, addOrderToCustomer?
     *
     * TODO: Test for all granular calculator errors
     */
  });
});
