import { Collection } from 'mongodb';
import * as MUUID from 'uuid-mongodb';
import { Injectable } from '@nestjs/common';
import { InjectCollection } from 'nest-mongodb';

import { UniqueEntityID } from '../../../../common/domain/UniqueEntityId';
import { CustomerRepositoryPort } from '../../../application/port/CustomerRepositoryPort';
import { Customer } from '../../../domain/entity/Customer';
import {
  mongoDocumentToCustomer,
  CustomerMongoDocument,
} from './CustomerMongoMapper';
import { Exception } from '../../../../common/error-handling/Exception';
import { Code } from '../../../../common/error-handling/Code';

@Injectable()
export class CustomerMongoRepositoryAdapter implements CustomerRepositoryPort {
  constructor(
    @InjectCollection('customers')
    private readonly customerCollection: Collection<CustomerMongoDocument>,
  ) {}

  async findCustomer(customerId: UniqueEntityID): Promise<Customer> {
    /*await this.customerCollection.insertOne({
      _id: MUUID.from('bbee31b0-14b4-4d7f-9f12-12456c686b19'),
      addresses: [{ selected: true, country: 'AUS' }],
    });*/

    const customerDocument: CustomerMongoDocument = await this.customerCollection.findOne(
      { _id: MUUID.from(customerId.toValue()) },
    );

    if (!customerDocument) {
      throw new Exception(
        Code.ENTITY_NOT_FOUND_ERROR,
        `Customer (id: ${customerId.toValue()}) not found`,
        { customerId },
      );
    }

    console.log(
      'Mongo customer doc id',
      customerDocument._id,
      MUUID.from(customerDocument._id).toString(),
    );
    return mongoDocumentToCustomer(customerDocument);
  }
}
