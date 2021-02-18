import * as supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { isUUID } from 'class-validator';

import { AppModule } from '../../../../src/AppModule';
import {
  Customer,
  CustomerPropsPlain,
} from '../../../../src/order/domain/entity/Customer';
import { OrderRepository } from '../../../../src/order/application/port/OrderRepository';
import { EntityId } from '../../../../src/common/domain/EntityId';
import { OrderStatus } from '../../../../src/order/domain/entity/Order';
import { CustomerRepository } from '../../../../src/order/application/port/CustomerRepository';
import { Address } from '../../../../src/order/domain/entity/Address';

describe('Create Order – POST /order/create', () => {
  let app: INestApplication;

  let customerRepository: CustomerRepository;
  let orderRepository: OrderRepository;

  let testOrderId: EntityId;
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
    testCustomer = new Customer({
      selectedAddress: new Address({ country: 'AUS' }),
      orderIds: [],
    });

    await customerRepository.addCustomer(testCustomer);
  });

  // Customer shouldn't be affected from test case to test case,
  // so we destroy it once, after all tests.
  afterAll(() => customerRepository.deleteCustomer(testCustomer.id));

  it('returns an Order object on proper Order Request format and existing customerId', async () => {
    const response: supertest.Response = await supertest(app.getHttpServer())
      .post('/order/create')
      .send({
        customerId: testCustomer.id.value,
        originCountry: testCustomer.selectedAddress.country,
        items: [
          {
            title: 'Laptop',
            storeName: 'Amazon',
            width: 100,
            height: 100,
            length: 100,
            weight: 10,
            category: 'Electronics',
          },
        ],
      });

    expect(response.status).toBe(201);

    // TODO: strong typing
    const {
      id,
      customerId,
      status,
      originCountry,
    }: {
      id: string;
      customerId: string;
      status: OrderStatus;
      originCountry: string;
    } = response.body;

    testOrderId = new EntityId(id);

    const updatedTestCustomer: Customer = await customerRepository.findCustomer(
      testCustomer.id,
    );

    expect(updatedTestCustomer.orderIds.map(({ value }) => value)).toContain(
      testOrderId.value,
    );
    expect(isUUID(id)).toBe(true);
    expect(customerId).toEqual(updatedTestCustomer.id.value);
    expect(status).toBe(OrderStatus.Drafted);
    expect(originCountry).toBe(testCustomer.selectedAddress.country);
  });
});
