import { ClientSession, Collection } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectCollection } from 'nest-mongodb';

import { UUID } from '../../../../common/domain';
import { CustomerRepository } from '../../../application/port/CustomerRepository';
import { Customer } from '../../../domain/entity/Customer';
import {
  mongoDocumentToCustomer,
  CustomerMongoDocument,
  customerToMongoDocument,
} from './CustomerMongoMapper';
import { Exception } from '../../../../common/error-handling';
import { Code } from '../../../../common/error-handling';
import { uuidToMuuid } from '../../../../common/persistence';

@Injectable()
export class CustomerMongoRepositoryAdapter implements CustomerRepository {
  constructor(
    @InjectCollection('customers')
    private readonly customerCollection: Collection<CustomerMongoDocument>,
  ) {}

  async addCustomer(
    customer: Customer,
    session?: ClientSession,
  ): Promise<void> {
    await this.customerCollection.insertOne(customerToMongoDocument(customer), {
      session,
    });
  }

  async deleteCustomer(
    customerId: UUID,
    session?: ClientSession,
  ): Promise<void> {
    await this.customerCollection.deleteOne(
      { _id: uuidToMuuid(customerId) },
      { session },
    );
  }

  async addOrderToCustomer(
    customerId: UUID,
    orderId: UUID,
    session?: ClientSession,
  ): Promise<void> {
    await this.customerCollection
      .updateOne(
        { _id: uuidToMuuid(customerId) },
        { $push: { orderIds: uuidToMuuid(orderId) } },
        { session },
      )
      .catch(error => {
        throw new Exception(
          Code.INTERNAL_ERROR,
          `Order couldn't be added to customer (orderId: ${orderId}, customerId: ${customerId}): ${error}`,
        );
      });
  }

  async removeOrderFromCustomer(
    customerId: UUID,
    orderId: UUID,
    session?: ClientSession,
  ): Promise<void> {
    await this.customerCollection
      .updateOne(
        { _id: uuidToMuuid(customerId) },
        { $pull: { orderIds: uuidToMuuid(orderId) } },
        { session },
      )
      .catch(error => {
        throw new Exception(
          Code.INTERNAL_ERROR,
          `Order couldn't be removed from customer (orderId: ${orderId}, customerId: ${customerId}): ${error}`,
        );
      });
  }

  async findCustomer(
    customerId: UUID,
    session?: ClientSession,
  ): Promise<Customer> {
    const customerDocument: CustomerMongoDocument = await this.customerCollection.findOne(
      { _id: uuidToMuuid(customerId) },
      { session },
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
