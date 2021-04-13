import { ClientSession, Collection } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectCollection } from 'nest-mongodb';

import { UUID } from '../../../../common/domain/UUID';
import { CustomerRepository } from '../../../application/port/CustomerRepository';
import { Customer } from '../../../domain/entity/Customer';
import {
  mongoDocumentToCustomer,
  CustomerMongoDocument,
  customerToMongoDocument,
} from './CustomerMongoMapper';
import { Exception } from '../../../../common/error-handling/Exception';
import { Code } from '../../../../common/error-handling/Code';
import { entityIdToMuuid } from '../../../../common/utils';
import { DraftedOrder } from '../../../domain/entity/DraftedOrder';

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
    customerId: UUID,
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
    { id: orderId }: DraftedOrder,
    transaction?: ClientSession,
  ): Promise<void> {
    await this.customerCollection
      .updateOne(
        { _id: entityIdToMuuid(customerId) },
        {
          $push: {
            orderIds: entityIdToMuuid(orderId),
          },
        },
        transaction ? { session: transaction } : undefined,
      )
      .catch(error => {
        throw new Exception(
          Code.INTERNAL_ERROR,
          `Customer couldn't accept order and add order to consumer (orderId: ${orderId}, customerId: ${customerId}): ${error}`,
        );
      });
  }

  async findCustomer(
    customerId: UUID,
    transaction?: ClientSession,
  ): Promise<Customer> {
    const customerDocument: CustomerMongoDocument = await this.customerCollection.findOne(
      { _id: entityIdToMuuid(customerId) },
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
