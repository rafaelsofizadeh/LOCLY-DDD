import {
  ClientSession,
  Collection,
  DeleteWriteOpResultObject,
  UpdateWriteOpResult,
} from 'mongodb';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectCollection } from 'nest-mongodb';

import { UUID } from '../../common/domain';
import { ICustomerRepository } from './ICustomerRepository';
import { Customer } from '../../order/entity/Customer';
import {
  mongoDocumentToCustomer,
  CustomerMongoDocument,
  customerToMongoDocument,
} from './CustomerMongoMapper';
import {
  expectOnlySingleResult,
  throwCustomException,
} from '../../common/error-handling';
import { uuidToMuuid } from '../../common/persistence';

@Injectable()
export class CustomerMongoRepositoryAdapter implements ICustomerRepository {
  constructor(
    @InjectCollection('customers')
    private readonly customerCollection: Collection<CustomerMongoDocument>,
  ) {}

  async addCustomer(
    customer: Customer,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    const customerDocument: CustomerMongoDocument = customerToMongoDocument(
      customer,
    );

    await this.customerCollection
      .insertOne(customerDocument, { session: mongoTransactionSession })
      .catch(
        throwCustomException('Error adding a customer', {
          customer,
        }),
      );
  }

  async deleteCustomer(
    customerId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    const deleteResult: DeleteWriteOpResultObject = await this.customerCollection
      .deleteOne(
        { _id: uuidToMuuid(customerId) },
        { session: mongoTransactionSession },
      )
      .catch(throwCustomException('Error deleting a customer', { customerId }));

    expectOnlySingleResult([deleteResult.deletedCount], {
      operation: 'deleting',
      entity: 'customer',
    });
  }

  async addOrderToCustomer(
    customerId: UUID,
    orderId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    const updateResult: UpdateWriteOpResult = await this.customerCollection
      .updateOne(
        { _id: uuidToMuuid(customerId) },
        { $push: { orderIds: uuidToMuuid(orderId) } },
        { session: mongoTransactionSession },
      )
      .catch(
        throwCustomException('Error adding order to a customer', {
          orderId,
          customerId,
        }),
      );

    expectOnlySingleResult(
      [updateResult.matchedCount, updateResult.modifiedCount],
      {
        operation: 'adding order to',
        entity: 'customer',
      },
      { customerId, orderId },
    );
  }

  async removeOrderFromCustomer(
    customerId: UUID,
    orderId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    const updateResult: UpdateWriteOpResult = await this.customerCollection
      .updateOne(
        { _id: uuidToMuuid(customerId) },
        { $pull: { orderIds: uuidToMuuid(orderId) } },
        { session: mongoTransactionSession },
      )
      .catch(
        throwCustomException('Error removing order from customer', {
          orderId,
          customerId,
        }),
      );

    expectOnlySingleResult(
      [updateResult.matchedCount, updateResult.modifiedCount],
      {
        operation: 'removing order from',
        entity: 'customer',
      },
    );
  }

  async findCustomer(
    customerId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<Customer> {
    const customerDocument: CustomerMongoDocument = await this.customerCollection
      .findOne(
        { _id: uuidToMuuid(customerId) },
        { session: mongoTransactionSession },
      )
      .catch(throwCustomException('Error finding a customer', { customerId }));

    if (!customerDocument) {
      throwCustomException(
        'No customer found',
        { customerId },
        HttpStatus.NOT_FOUND,
      )();
    }

    return mongoDocumentToCustomer(customerDocument);
  }
}
