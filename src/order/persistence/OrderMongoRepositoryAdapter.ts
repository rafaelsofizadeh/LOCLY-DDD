import { Injectable } from '@nestjs/common';
import {
  Binary,
  ClientSession,
  Collection,
  DeleteWriteOpResultObject,
  FilterQuery,
  UpdateWriteOpResult,
} from 'mongodb';
import { InjectCollection } from 'nest-mongodb';

import { UUID, WithoutId } from '../../common/domain';
import {
  expectOnlySingleResult,
  throwCustomException,
} from '../../common/error-handling';
import { IOrderRepository } from './IOrderRepository';
import { Order, DraftedOrder, OrderFilter } from '../entity/Order';
import {
  OrderMongoDocument,
  Photo,
  normalizeOrderFilter,
  normalizeItemFilter,
} from './OrderMongoMapper';
import {
  mongoQuery,
  muuidToUuid,
  uuidToMuuid,
  convertToMongoDocument,
  serializeMongoData,
} from '../../common/persistence';
import { ItemFilter } from '../entity/Item';
import { ItemPhotosUploadResult } from '../application/AddItemPhoto/IAddItemPhoto';

@Injectable()
export class OrderMongoRepositoryAdapter implements IOrderRepository {
  constructor(
    @InjectCollection('orders')
    private readonly orderCollection: Collection<OrderMongoDocument>,
  ) {}

  async addOrder(
    draftOrder: DraftedOrder,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    const draftOrderDocument = convertToMongoDocument(draftOrder);

    await this.orderCollection
      .insertOne(draftOrderDocument, { session: mongoTransactionSession })
      .catch(
        throwCustomException(
          'Error creating a new draftOrder in the database',
          { draftOrder, draftOrderDocument },
        ),
      );
  }

  // TODO: Vary allowed properties based on OrderStatus
  async setProperties(
    filter: OrderFilter,
    // TODO: better type naming for OrderFilter here
    properties: WithoutId<OrderFilter>,
    mongoTransactionSession?: ClientSession,
  ) {
    const filterWithId = normalizeOrderFilter(filter);
    const filterQuery: FilterQuery<OrderMongoDocument> = mongoQuery(
      filterWithId,
    );

    const updateResult: UpdateWriteOpResult = await this.orderCollection
      .updateOne(
        filterQuery,
        { $set: mongoQuery(properties) },
        { session: mongoTransactionSession },
      )
      .catch(
        throwCustomException('Error updating order', {
          filter,
          properties,
        }),
      );

    expectOnlySingleResult(
      [updateResult.matchedCount, updateResult.modifiedCount],
      {
        operation: 'setting properties on',
        entity: 'order',
      },
      { filter, properties },
    );
  }

  async findOrder(
    filter: OrderFilter,
    mongoTransactionSession?: ClientSession,
  ): Promise<Order> {
    // TODO: better typing using FilterQuery
    const filterWithId = normalizeOrderFilter(filter);
    const filterQuery: FilterQuery<OrderMongoDocument> = mongoQuery(
      filterWithId,
    );

    const orderDocument: OrderMongoDocument = await this.orderCollection
      .findOne(filterQuery, { session: mongoTransactionSession })
      .catch(throwCustomException('Error searching for an order', filter));

    if (!orderDocument) {
      throwCustomException('No order found', filter)();
    }

    return serializeMongoData(orderDocument);
  }

  async findOrders(
    orderIds: UUID[],
    mongoTransactionSession?: ClientSession,
  ): Promise<Order[]> {
    const orderMongoBinaryIds: Binary[] = orderIds.map(orderId =>
      uuidToMuuid(orderId),
    );

    const orderDocuments: OrderMongoDocument[] = await this.orderCollection
      .find(
        { _id: { $in: orderMongoBinaryIds } },
        { session: mongoTransactionSession },
      )
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
      serializeMongoData(orderDocument),
    );
  }

  async deleteOrder(
    filter: OrderFilter,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    const filterWithId = normalizeOrderFilter(filter);
    const filterQuery: FilterQuery<OrderMongoDocument> = mongoQuery(
      filterWithId,
    );

    const deleteResult: DeleteWriteOpResultObject = await this.orderCollection
      .deleteOne(filterQuery, {
        session: mongoTransactionSession,
      })
      .catch(throwCustomException('Error deleting order', filter));

    expectOnlySingleResult(
      [deleteResult.deletedCount],
      {
        operation: 'deleting',
        entity: 'order',
      },
      filter,
    );
  }

  // TODO: Merge orderFilter and itemFilter
  async setItemProperties(
    orderFilter: OrderFilter,
    itemFilter: ItemFilter,
    properties: WithoutId<ItemFilter>,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    const orderFilterWithId = normalizeOrderFilter(orderFilter);
    const itemFilterWithId = normalizeItemFilter(itemFilter);

    const filter = {
      ...orderFilterWithId,
      items: itemFilterWithId,
    };

    const filterQuery = mongoQuery(filter);

    const itemSetQuery = mongoQuery({ 'items.$': properties });

    const updateResult: UpdateWriteOpResult = await this.orderCollection
      .updateOne(
        filterQuery,
        { $set: itemSetQuery },
        { session: mongoTransactionSession },
      )
      .catch(
        throwCustomException('Error updating order item', {
          filter,
          properties,
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
        filter,
        properties,
      },
    );
  }

  async addItemPhotos(
    orderFilter: OrderFilter,
    itemFilter: ItemFilter,
    photos: Photo[],
    mongoTransactionSession?: ClientSession,
  ): Promise<ItemPhotosUploadResult> {
    const { status, ...restOrderFilterWithId } = normalizeOrderFilter(
      orderFilter,
    );
    const itemFilterWithId = normalizeItemFilter(itemFilter);

    const filter = {
      ...restOrderFilterWithId,
      items: itemFilterWithId,
    };

    const filterQueryWithoutReceivedCheck = mongoQuery(filter);
    // TODO:
    const receivedCheck = {
      'items.receivedDate': { $ne: null },
    };

    // TODO: Beautify
    const statusQuery = status
      ? {
          status: Array.isArray(status) ? { $in: status } : status,
        }
      : {};

    const filterQuery = {
      ...filterQueryWithoutReceivedCheck,
      ...statusQuery,
      ...receivedCheck,
    };

    // TODO: typing
    // TODO: Error handling on photos
    const photoMuuids = photos.map(({ id }) => id);
    const photoUploadResults: ItemPhotosUploadResult = photos.map(
      ({ id, filename }) => ({
        id: muuidToUuid(id),
        photoName: filename,
      }),
    );

    // https://docs.mongodb.com/manual/reference/operator/update/positional/
    const result: UpdateWriteOpResult = await this.orderCollection
      .updateOne(
        filterQuery,
        // $each: https://docs.mongodb.com/manual/reference/operator/update/push/#append-multiple-values-to-an-array
        // TODO:
        {
          $push: {
            'items.$.photos': {
              $each: photoMuuids,
            },
          },
        },
        { session: mongoTransactionSession },
      )
      .catch(
        throwCustomException('Error adding photo file id to order item', {
          orderFilter,
          itemFilter: {
            ...itemFilter,
            receivedDate: 'NOT_NULL',
          },
        }),
      );

    expectOnlySingleResult(
      [result.matchedCount, result.modifiedCount],
      {
        operation: 'adding photo id to',
        entity: 'order item',
      },
      {
        orderFilter,
        // TODO:
        itemFilter: {
          ...itemFilter,
          receivedDate: 'NOT_NULL',
        },
      },
    );

    return photoUploadResults;
  }
}
