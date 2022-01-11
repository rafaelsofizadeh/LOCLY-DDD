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
import {
  AllowedCustomerProperties,
  ICustomerRepository,
} from './ICustomerRepository';
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
import { convertToMongoDocument, mongoQuery } from '../../common/persistence';
import { isNotEmptyObject } from 'class-validator';

enum ArrayAction {
  Add = 'add',
  Remove = 'remove',
}

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

    const {
      deletedCount,
    }: DeleteWriteOpResultObject = await this.customerCollection
      .deleteOne(filterQuery, { session: mongoTransactionSession })
      .catch(throwCustomException('Error deleting a customer', filter));

    expectOnlySingleResult([deletedCount], {
      operation: 'deleting',
      entity: 'customer',
    });
  }

  async addOrder(
    filter: CustomerFilter,
    orderId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    await this.addOrRemoveEntityToArrayProp(
      ArrayAction.Add,
      filter,
      'orderIds',
      orderId,
      mongoTransactionSession,
    );
  }

  async removeOrder(
    filter: CustomerFilter,
    orderId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    await this.addOrRemoveEntityToArrayProp(
      ArrayAction.Remove,
      filter,
      'orderIds',
      orderId,
      mongoTransactionSession,
    );
  }

  async addOrRemoveEntityToArrayProp<
    P extends keyof Customer,
    R extends Pick<Customer, P>[P] extends Array<infer E> ? E : never
  >(
    action: ArrayAction,
    filter: CustomerFilter,
    // TODO: combine prop & entity into a single argument { [prop]: entity }
    prop: Pick<Customer, P>[P] extends any[] ? P : never,
    entity: R,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    const filterWithId = normalizeCustomerFilter(filter);
    const filterQuery: FilterQuery<CustomerMongoDocument> = mongoQuery(
      filterWithId,
    );

    const queryArgument = { [prop]: entity };
    const updateQuery =
      action === 'add' ? { $push: queryArgument } : { $pull: queryArgument };

    const errorAction = `${action === 'add' ? 'adding to' : 'removing from'}`;

    const {
      matchedCount,
      modifiedCount,
    }: UpdateWriteOpResult = await this.customerCollection
      .updateOne(filterQuery, updateQuery, { session: mongoTransactionSession })
      .catch(
        throwCustomException(`Error ${errorAction} a customer ${prop}`, {
          action,
          [prop]: entity,
          customerFilter: filter,
        }),
      );

    expectOnlySingleResult(
      [matchedCount, modifiedCount],
      {
        operation: `${errorAction} ${prop} of`,
        entity: 'customer',
      },
      { customerFilter: filter, [prop]: entity },
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

  async setProperties(
    filter: CustomerFilter,
    properties: AllowedCustomerProperties,
    mongoTransactionSession?: ClientSession,
  ) {
    if (!isNotEmptyObject(filter) || !isNotEmptyObject(properties)) {
      return;
    }

    const filterWithId = normalizeCustomerFilter(filter);
    const filterQuery: FilterQuery<CustomerMongoDocument> = mongoQuery(
      filterWithId,
    );

    // The reason not to use mongoQuery here is because mongoQuery flattens array objects, which has effects on
    // $set: { addresses: [...] }
    const updateQuery = convertToMongoDocument(properties);

    const {
      matchedCount,
      modifiedCount,
    }: UpdateWriteOpResult = await this.customerCollection
      .updateOne(
        filterQuery,
        { $set: updateQuery },
        { session: mongoTransactionSession },
      )
      .catch(
        throwCustomException('Error updating customer', {
          filter,
          properties,
        }),
      );

    expectOnlySingleResult(
      [matchedCount, modifiedCount],
      {
        operation: 'setting properties on',
        entity: 'customer',
      },
      { filter, properties },
    );
  }
}
