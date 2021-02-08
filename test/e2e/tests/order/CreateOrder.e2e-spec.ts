import * as mongo from 'mongodb';
import * as supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '../../../../src/AppModule';
import { CustomerFixture } from '../../fixture/CustomerFixture';
import { Customer } from '../../../../src/order/domain/entity/Customer';
import { isUUID } from 'class-validator';
import { classToPlain } from 'class-transformer';

describe('Create Order – POST /order/create', () => {
  let app: INestApplication;
  let customerFixture: CustomerFixture;
  let testCustomer: Customer;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    customerFixture = new CustomerFixture(
      // TODO: how to use @InjectCollection without inserting the string token manually?
      moduleRef.get<mongo.Collection>(`customersCollection`),
    );
  });

  beforeEach(async () => {
    testCustomer = await customerFixture.insertTestCustomer();
  });

  afterEach(() => customerFixture.deleteTestCustomer());

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

    expect(isUUID(body.id)).toBe(true);
    expect(body.customer).toEqual(classToPlain(testCustomer));
    expect(body.status).toBe('submitted');
    expect(body.originCountry).toBe(testCustomer.selectedAddress.country);
  });
});
