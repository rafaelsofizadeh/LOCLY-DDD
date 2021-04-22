import * as supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { isUUID } from 'class-validator';

import { AppModule } from '../../../../src/AppModule';
import { Customer } from '../../../../src/order/domain/entity/Customer';
import { OrderRepository } from '../../../../src/order/application/port/OrderRepository';
import { UUID } from '../../../../src/common/domain/UUID';
import { OrderStatus } from '../../../../src/order/domain/entity/Order';
import { CustomerRepository } from '../../../../src/order/application/port/CustomerRepository';
import { Address } from '../../../../src/order/domain/entity/Address';
import { Category } from '../../../../src/order/domain/entity/Item';
import {
  destinationCountriesAvailable,
  originCountriesAvailable,
} from '../../../../src/order/application/services/checkServiceAvailability';

// TODO(GLOBAL)(TESTING): Substitute database name in tests

describe('Create Order – POST /order/create', () => {
  let app: INestApplication;

  let customerRepository: CustomerRepository;
  let orderRepository: OrderRepository;

  let testOrderId: UUID;
  let testCustomer: Customer;

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

    // Customer shouldn't be affected from test case to test case,
    // so we initialize it once, before all tests.
    testCustomer = Customer.create({
      selectedAddress: { country: destinationCountriesAvailable[1] },
      orderIds: [],
    });

    await customerRepository.addCustomer(testCustomer);
  });

  // Customer shouldn't be affected from test case to test case,
  // so we destroy it once, after all tests.
  afterAll(() =>
    Promise.all([
      customerRepository.deleteCustomer(testCustomer.id),
      orderRepository.deleteOrder(testOrderId),
    ]),
  );

  it('returns an Order object on proper Order Request format and existing customerId', async () => {
    const response: supertest.Response = await supertest(app.getHttpServer())
      .post('/order/create')
      .send({
        customerId: testCustomer.id,
        originCountry: originCountriesAvailable[0],
        destination: testCustomer.selectedAddress,
        // TODO: Item fixture
        items: [
          {
            title: 'Laptop',
            storeName: 'Amazon',
            width: 100,
            height: 100,
            length: 100,
            weight: 1500,
            category: Category.Electronics,
          },
        ],
      });

    expect(response.status).toBe(201);

    // TODO: strong typing
    // TODO(GLOBAL): Serialization of Order types with status fill-in
    const {
      id,
      customerId,
      status,
      destination,
    }: {
      id: string;
      customerId: string;
      status: OrderStatus;
      destination: Address;
    } = response.body;

    testOrderId = UUID(id);

    // TODO(IMPORTANT): Check if order has been added to database

    const updatedTestCustomer: Customer = await customerRepository.findCustomer(
      testCustomer.id,
    );

    expect(updatedTestCustomer.orderIds).toContain(testOrderId);
    expect(isUUID(id)).toBe(true);
    expect(customerId).toEqual(updatedTestCustomer.id);
    // Test for order's status (which is stored only in DB and serialized out)
    expect(destination.country).toBe(testCustomer.selectedAddress.country);
  });
});
