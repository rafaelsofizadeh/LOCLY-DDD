import { Injectable } from '@nestjs/common';
import { promisify } from 'util';
import { PromiseWritable } from 'promise-writable';
import {
  Binary,
  ClientSession,
  Collection,
  DeleteWriteOpResultObject,
  FilterQuery,
  UpdateWriteOpResult,
} from 'mongodb';
import { InjectCollection } from 'nest-mongodb';

import { UUID, WithoutId } from '../../../../common/domain';
import {
  expectOnlySingleResult,
  throwCustomException,
} from '../../../../common/error-handling';
import { OrderRepository } from '../../../application/port/OrderRepository';
import { Order, OrderFilter } from '../../../domain/entity/Order';
import {
  OrderMongoDocument,
  draftOrderToMongoDocument,
  mongoDocumentToOrder,
  Photo,
} from './OrderMongoMapper';
import { DraftOrder } from '../../../domain/entity/DraftOrder';
import { mongoQuery, uuidToMuuid } from '../../../../common/persistence';
import { ItemFilter } from '../../../domain/entity/Item';

@Injectable()
export class OrderMongoRepositoryAdapter implements OrderRepository {
  constructor(
    @InjectCollection('orders')
    private readonly orderCollection: Collection<OrderMongoDocument>,
    private readonly itemPhotoStorage: ItemPhotoStorage,
  ) {}

  async addOrder(
    draftOrder: DraftOrder,
    session?: ClientSession,
  ): Promise<void> {
    const draftOrderDocument = draftOrderToMongoDocument(draftOrder);

    await this.orderCollection
      .insertOne(draftOrderDocument, { session })
      .catch(
        throwCustomException(
          'Error creating a new draftOrder in the database',
          { draftOrder, draftOrderDocument },
        ),
      );
  }

  async setProperties(
    filter: OrderFilter,
    // TODO: better type naming for OrderFilter here
    properties: WithoutId<OrderFilter>,
    session?: ClientSession,
  ) {
    const updateResult: UpdateWriteOpResult = await this.orderCollection
      .updateOne(
        mongoQuery(filter),
        { $set: mongoQuery(properties) },
        { session },
      )
      .catch(
        throwCustomException('Error updating order', {
          orderId: filter.id,
          properties,
          filter,
        }),
      );

    expectOnlySingleResult(
      [updateResult.matchedCount, updateResult.modifiedCount],
      {
        operation: 'setting properties on',
        entity: 'order',
      },
    );
  }

  async findOrder(
    filter: OrderFilter,
    session?: ClientSession,
  ): Promise<Order> {
    // TODO: better typing using FilterQuery
    const filterQuery: FilterQuery<OrderMongoDocument> = mongoQuery(filter);

    const orderDocument: OrderMongoDocument = await this.orderCollection
      .findOne(filterQuery, { session })
      .catch(
        throwCustomException('Error searching for an order', {
          orderId: filter.id,
          filter,
        }),
      );

    if (!orderDocument) {
      throwCustomException('No order found', {
        orderId: filter.id,
        filter,
      })();
    }

    return mongoDocumentToOrder(orderDocument);
  }

  async findOrders(
    orderIds: UUID[],
    session?: ClientSession,
  ): Promise<Order[]> {
    const orderMongoBinaryIds: Binary[] = orderIds.map(orderId =>
      uuidToMuuid(orderId),
    );

    const orderDocuments: OrderMongoDocument[] = await this.orderCollection
      .find({ _id: { $in: orderMongoBinaryIds } }, { session })
      .toArray();

    // To access all orderIds and failedOrderIds, catch the exception and access its 'data' property
    if (orderDocuments.length !== orderIds.length) {
      const failedOrderIds: UUID[] = orderIds.filter(
        orderId =>
          orderDocuments.findIndex(
            orderDocument => uuidToMuuid(orderId) === orderDocument._id,
          ) === -1,
      );

      throwCustomException('Orders not found', {
        orderIds,
        failedOrderIds,
      })();
    }

    return orderDocuments.map(orderDocument =>
      mongoDocumentToOrder(orderDocument),
    );
  }

  async deleteOrder(
    filter: OrderFilter,
    session?: ClientSession,
  ): Promise<void> {
    const deleteResult: DeleteWriteOpResultObject = await this.orderCollection
      .deleteOne(mongoQuery(filter), {
        session,
      })
      .catch(
        throwCustomException('Error deleting order', {
          orderId: filter.id,
          filter,
        }),
      );

    expectOnlySingleResult([deleteResult.deletedCount], {
      operation: 'deleting',
      entity: 'order',
    });
  }

  // TODO: Merge orderFilter and itemFilter
  async setItemProperties(
    orderFilter: OrderFilter,
    itemFilter: ItemFilter,
    properties: WithoutId<ItemFilter>,
    session?: ClientSession,
  ): Promise<void> {
    const filter = {
      ...orderFilter,
      items: itemFilter,
    };
    const queryWithoutReceivedCheck = mongoQuery(filter);
    const query = {
      ...queryWithoutReceivedCheck,
      // Can't receive an already-received item
      // Query for undefined field https://docs.mongodb.com/manual/tutorial/query-for-null-fields/#existence-check
      'items.receivedDate': null,
    };

    const itemSetQuery = mongoQuery({ 'items.$': properties });

    const updateResult: UpdateWriteOpResult = await this.orderCollection
      .updateOne(query, { $set: itemSetQuery }, { session })
      .catch(
        throwCustomException('Error updating order item', {
          orderId: filter.id,
          itemId: filter.items.id,
          properties,
          filter,
        }),
      );

    expectOnlySingleResult(
      [updateResult.matchedCount, updateResult.modifiedCount],
      {
        operation: 'setting properties on',
        entity: 'order item',
        lessThanMessage:
          "the item either doesn't exist, or has already been received",
      },
      {
        orderId: filter.id,
        itemId: filter.items.id,
        properties,
        filter,
      },
    );
  }
}
