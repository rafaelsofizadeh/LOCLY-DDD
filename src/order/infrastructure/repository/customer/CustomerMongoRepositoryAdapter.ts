import { Collection } from 'mongodb';
import * as MUUID from 'uuid-mongodb';
import { Injectable } from '@nestjs/common';
import { InjectCollection } from 'nest-mongodb';

import { EntityId } from '../../../../common/domain/EntityId';
import { CustomerRepository } from '../../../application/port/CustomerRepository';
import { Customer } from '../../../domain/entity/Customer';
import {
  mongoDocumentToCustomer,
  CustomerMongoDocument,
} from './CustomerMongoMapper';
import { Exception } from '../../../../common/error-handling/Exception';
import { Code } from '../../../../common/error-handling/Code';

@Injectable()
export class CustomerMongoRepositoryAdapter implements CustomerRepository {
  constructor(
    @InjectCollection('customers')
    private readonly customerCollection: Collection<CustomerMongoDocument>,
  ) {}

  async findCustomer(customerId: EntityId): Promise<Customer> {
    /*await this.customerCollection.insertOne({
      _id: MUUID.from('bbee31b0-14b4-4d7f-9f12-12456c686b19'),
      addresses: [{ selected: true, country: 'AUS' }],
    });*/

    const customerDocument: CustomerMongoDocument = await this.customerCollection.findOne(
      { _id: MUUID.from(customerId.value) },
    );

    if (!customerDocument) {
      throw new Exception(
        Code.ENTITY_NOT_FOUND_ERROR,
        `Customer (id: ${customerId.value}) not found`,
        { customerId },
      );
    }

    return mongoDocumentToCustomer(customerDocument);
  }
}
