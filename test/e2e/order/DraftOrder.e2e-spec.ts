import supertest from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { isUUID } from 'class-validator';

import countries from '../../../src/calculator/data/CountryIsoCodes';
import { AppModule } from '../../../src/AppModule';
import { Customer } from '../../../src/customer/entity/Customer';
import { Address, UUID } from '../../../src/common/domain';
import { DraftOrderRequest } from '../../../src/order/application/DraftOrder/IDraftOrder';
import {
  OrderStatus,
  DraftedOrder,
  Order,
} from '../../../src/order/entity/Order';
import { Country } from '../../../src/order/entity/Country';
import {
  getDestinationCountriesAvailable,
  originCountriesAvailable,
} from '../../../src/calculator/data/PriceGuide';
import { setupNestApp } from '../../../src/main';
import { EntityType } from '../../../src/auth/entity/Token';
import { IGetCustomer } from '../../../src/customer/application/GetCustomer/IGetCustomer';
import { authorize, createTestCustomer } from '../utilities';
import { IGetOrder } from '../../../src/order/application/GetOrder/IGetOrder';
import { IDeleteCustomer } from '../../../src/customer/application/DeleteCustomer/IDeleteCustomer';

describe('[POST /order/draft] IDraftOrder', () => {
  let app: INestApplication;
  let agent: ReturnType<typeof supertest.agent>;

  let getCustomer: IGetCustomer;
  let deleteCustomer: IDeleteCustomer;

  let getOrder: IGetOrder;

  const originCountry: Country = originCountriesAvailable[0];
  const destinationCountry: Country = getDestinationCountriesAvailable(
    originCountry,
  )[0];

  let customer: Customer;
  let address: Address;

  let orderId: UUID;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await setupNestApp(app);
    await app.init();

    ({
      customer,
      customer: {
        addresses: [address],
      },
      getCustomer,
      deleteCustomer,
    } = await createTestCustomer(destinationCountry, moduleRef));

    agent = await authorize(app, moduleRef, customer.email);

    getOrder = await moduleRef.resolve(IGetOrder);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('interact with DB and require invididual teardown', () => {
    afterAll(() =>
      Promise.all([
        // See IDeleteCustomer implementation. Customer's drafted orders get deleted too.
        // orderRepository.deleteOrder({ orderId: testOrderId }),
        deleteCustomer.execute({ port: { customerId: customer.id } }),
      ]),
    );

    it('successfully creates a Order', async () => {
      const testOrderRequest: DraftOrderRequest = {
        originCountry: originCountriesAvailable[0],
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
        port: { orderId, userId: customer.id, userType: EntityType.Customer },
      });

      // Order should have a 'Drafted' status
      expect(addedOrder.status).toBe(OrderStatus.Drafted);
      // Order should be assigned its customer's id.
      expect(addedOrder.customerId).toBe(customer.id);

      // Load the updated customer from the database
      const updatedCustomer: Customer = await getCustomer.execute({
        port: { customerId: customer.id },
      });

      // Order customerId should be the same as customer id
      expect(customerId).toEqual(updatedCustomer.id);
      // Order id should be added to customer orderIds (i.e. order is assigned to customer)
      expect(updatedCustomer.orderIds).toContain(orderId);
      // Customer's address should be set on the order
      expect(destination).toEqual(address);
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
        originCountry: originCountriesAvailable[0],
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
