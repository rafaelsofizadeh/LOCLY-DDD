import * as supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { isUUID } from 'class-validator';
import { classToPlain } from 'class-transformer';

import { AppModule } from '../../../../src/AppModule';
import { Customer } from '../../../../src/order/domain/entity/Customer';
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
    });

    await customerRepository.addCustomer(testCustomer);
  });

  // Customer shouldn't be affected from test case to test case,
  // so we destroy it once, after all tests.
  afterAll(() => customerRepository.deleteCustomer(testCustomer));

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

    const body = response.body;
    testOrderId = new EntityId(body.id);

    expect(isUUID(body.id)).toBe(true);
    expect(body.customer).toEqual(classToPlain(testCustomer));
    expect(body.status).toBe(OrderStatus.Drafted);
    expect(body.originCountry).toBe(testCustomer.selectedAddress.country);
  });
});
