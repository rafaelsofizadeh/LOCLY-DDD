import { ClientSession, Collection } from 'mongodb';
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
    customerId: EntityId,
    transaction?: ClientSession,
  ): Promise<void> {
    await this.customerCollection.deleteOne(
      {
        _id: entityIdToMuuid(customerId),
      },
      transaction ? { session: transaction } : undefined,
    );
  }

  // This should always be used together with OrderRepository.addCustomerToOrder
  async addOrderToCustomer(
    { id: customerId }: Customer,
    { id: orderId }: Order,
    transaction?: ClientSession,
  ): Promise<void> {
    await this.customerCollection.updateOne(
      { _id: entityIdToMuuid(customerId) },
      {
        $push: {
          orderIds: entityIdToMuuid(orderId),
        },
      },
      transaction ? { session: transaction } : undefined,
    );
  }

  async findCustomer(
    customerId: EntityId,
    transaction?: ClientSession,
  ): Promise<Customer> {
    const customerDocument: CustomerMongoDocument = await this.customerCollection.findOne(
      { _id: entityIdToMuuid(customerId) },
      transaction ? { session: transaction } : undefined,
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
