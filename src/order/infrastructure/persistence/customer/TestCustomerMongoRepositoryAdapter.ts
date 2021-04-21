import { ClientSession, Collection } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectCollection } from 'nest-mongodb';

import { UUID } from '../../../../common/domain/UUID';
import { Customer } from '../../../domain/entity/Customer';
import {
  mongoDocumentToCustomer,
  CustomerMongoDocument,
  customerToMongoDocument,
} from './CustomerMongoMapper';
import { Exception } from '../../../../common/error-handling/Exception';
import { Code } from '../../../../common/error-handling/Code';
import { uuidToMuuid } from '../../../../common/utils';
import { TestCustomerRepository } from '../../../application/port/customer/TestCustomerRepository';

@Injectable()
export class TestCustomerMongoRepositoryAdapter
  implements TestCustomerRepository {
  constructor(
    @InjectCollection('test_customers')
    private readonly customerCollection: Collection<CustomerMongoDocument>,
  ) {}

  async addCustomer(
    customer: Customer,
    transaction?: ClientSession,
  ): Promise<void> {
    await this.customerCollection.insertOne(
      customerToMongoDocument(customer),
      transaction
        ? {
            session: transaction,
          }
        : undefined,
    );
  }

  async deleteCustomer(
    customerId: UUID,
    transaction?: ClientSession,
  ): Promise<void> {
    await this.customerCollection.deleteOne(
      {
        _id: uuidToMuuid(customerId),
      },
      transaction ? { session: transaction } : undefined,
    );
  }

  async findCustomer(
    customerId: UUID,
    transaction?: ClientSession,
  ): Promise<Customer> {
    const customerDocument: CustomerMongoDocument = await this.customerCollection.findOne(
      { _id: uuidToMuuid(customerId) },
      transaction ? { session: transaction } : undefined,
    );

    if (!customerDocument) {
      throw new Exception(
        Code.ENTITY_NOT_FOUND_ERROR,
        `Customer (id: ${customerId}) not found`,
        { customerId },
      );
    }

    return mongoDocumentToCustomer(customerDocument);
  }
}
