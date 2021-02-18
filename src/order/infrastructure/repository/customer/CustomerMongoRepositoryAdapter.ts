import { Collection } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectCollection } from 'nest-mongodb';

import { EntityId } from '../../../../common/domain/EntityId';
import { CustomerRepository } from '../../../application/port/CustomerRepository';
import { Customer } from '../../../domain/entity/Customer';
import {
  mongoDocumentToCustomer,
  CustomerMongoDocument,
  customerToMongoDocument,
} from './CustomerMongoMapper';
import { Exception } from '../../../../common/error-handling/Exception';
import { Code } from '../../../../common/error-handling/Code';
import { Order } from '../../../domain/entity/Order';
import { entityIdToMuuid } from '../../../../common/utils';

@Injectable()
export class CustomerMongoRepositoryAdapter implements CustomerRepository {
  constructor(
    @InjectCollection('customers')
    private readonly customerCollection: Collection<CustomerMongoDocument>,
  ) {}

  async addCustomer(customer: Customer): Promise<void> {
    this.customerCollection.insertOne(customerToMongoDocument(customer));
  }

  async deleteCustomer(customerId: EntityId): Promise<void> {
    this.customerCollection.deleteOne({
      _id: entityIdToMuuid(customerId),
    });
  }

  // This should always be used together with OrderRepository.addCustomerToOrder
  async addOrderToCustomer(
    { id: customerId }: Customer,
    { id: orderId }: Order,
  ): Promise<void> {
    await this.customerCollection.updateOne(
      { _id: entityIdToMuuid(customerId) },
      {
        $push: {
          orderIds: entityIdToMuuid(orderId),
        },
      },
    );
  }

  async findCustomer(customerId: EntityId): Promise<Customer> {
    const customerDocument: CustomerMongoDocument = await this.customerCollection.findOne(
      { _id: entityIdToMuuid(customerId) },
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
