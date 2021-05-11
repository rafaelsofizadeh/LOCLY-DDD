import {
  ClientSession,
  Collection,
  DeleteWriteOpResultObject,
  FilterQuery,
  UpdateWriteOpResult,
} from 'mongodb';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectCollection } from 'nest-mongodb';

import { UUID } from '../../common/domain';
import { ICustomerRepository } from './ICustomerRepository';
import { Customer, CustomerFilter } from '../entity/Customer';
import {
  mongoDocumentToCustomer,
  CustomerMongoDocument,
  customerToMongoDocument,
  normalizeCustomerFilter,
} from './CustomerMongoMapper';
import {
  expectOnlySingleResult,
  throwCustomException,
} from '../../common/error-handling';
import { mongoQuery, uuidToMuuid } from '../../common/persistence';

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
    filter: CustomerFilter,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    const filterWithId = normalizeCustomerFilter(filter);
    const filterQuery: FilterQuery<CustomerMongoDocument> = mongoQuery(
      filterWithId,
    );

    const deleteResult: DeleteWriteOpResultObject = await this.customerCollection
      .deleteOne(filterQuery, { session: mongoTransactionSession })
      .catch(throwCustomException('Error deleting a customer', filter));

    expectOnlySingleResult([deleteResult.deletedCount], {
      operation: 'deleting',
      entity: 'customer',
    });
  }

  async addOrderToCustomer(
    filter: CustomerFilter,
    orderId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    const filterWithId = normalizeCustomerFilter(filter);
    const filterQuery: FilterQuery<CustomerMongoDocument> = mongoQuery(
      filterWithId,
    );

    const updateResult: UpdateWriteOpResult = await this.customerCollection
      .updateOne(
        filterQuery,
        { $push: { orderIds: uuidToMuuid(orderId) } },
        { session: mongoTransactionSession },
      )
      .catch(
        throwCustomException('Error adding order to a customer', {
          orderId,
          customerFilter: filter,
        }),
      );

    expectOnlySingleResult(
      [updateResult.matchedCount, updateResult.modifiedCount],
      {
        operation: 'adding order to',
        entity: 'customer',
      },
      { customerFilter: filter, orderId },
    );
  }

  async removeOrderFromCustomer(
    filter: CustomerFilter,
    orderId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    const filterWithId = normalizeCustomerFilter(filter);
    const filterQuery: FilterQuery<CustomerMongoDocument> = mongoQuery(
      filterWithId,
    );

    const updateResult: UpdateWriteOpResult = await this.customerCollection
      .updateOne(
        filterQuery,
        { $pull: { orderIds: uuidToMuuid(orderId) } },
        { session: mongoTransactionSession },
      )
      .catch(
        throwCustomException('Error removing order from customer', {
          orderId,
          customerFilter: filter,
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
    filter: CustomerFilter,
    mongoTransactionSession?: ClientSession,
    throwIfNotFound: boolean = true,
  ): Promise<Customer> {
    const filterWithId = normalizeCustomerFilter(filter);
    const filterQuery: FilterQuery<CustomerMongoDocument> = mongoQuery(
      filterWithId,
    );

    const customerDocument: CustomerMongoDocument = await this.customerCollection
      .findOne(filterQuery, { session: mongoTransactionSession })
      .catch(throwCustomException('Error finding a customer', filter));

    if (!customerDocument) {
      if (throwIfNotFound) {
        throwCustomException(
          'No customer found',
          filter,
          HttpStatus.NOT_FOUND,
        )();
      }

      return;
    }

    return mongoDocumentToCustomer(customerDocument);
  }
}
