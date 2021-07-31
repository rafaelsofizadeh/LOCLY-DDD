import { Injectable } from '@nestjs/common';
import {
  Binary,
  ClientSession,
  Collection,
  DeleteWriteOpResultObject,
  FilterQuery,
  ReplaceWriteOpResult,
  UpdateWriteOpResult,
} from 'mongodb';
import { InjectCollection } from 'nest-mongodb';
import { isNotEmptyObject } from 'class-validator';

import { UUID } from '../../common/domain';
import {
  expectOnlyNResults,
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

    const {
      modifiedCount,
      upsertedCount,
    }: ReplaceWriteOpResult = await this.orderCollection
      .replaceOne({ _id: draftOrderDocument._id }, draftOrderDocument, {
        upsert: true,
        session: mongoTransactionSession,
      })
      .catch(
        throwCustomException(
          'Error creating a new draftOrder in the database',
          { draftOrder, draftOrderDocument },
        ),
      );

    expectOnlySingleResult(
      [modifiedCount + upsertedCount],
      {
        operation: 'setting properties on',
        entity: 'order',
      },
      { orderId: draftOrder.id },
    );
  }

  // Overloads are set in IOrderRepository, and OrderRepository is injected through that
  // interface / abstract class, so function signature here doesn't really matter — purposefully
  // as general as possible. SEE IOrderRepository.
  async setProperties(
    filter: OrderFilter,
    properties: OrderFilter,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    if (!isNotEmptyObject(filter) || !isNotEmptyObject(properties)) {
      return;
    }

    const filterWithId = normalizeOrderFilter(filter);
    const filterQuery: FilterQuery<OrderMongoDocument> = mongoQuery(
      filterWithId,
    );

    const updateQuery = mongoQuery(properties);

    const {
      matchedCount,
      modifiedCount,
    }: UpdateWriteOpResult = await this.orderCollection
      .updateOne(
        filterQuery,
        { $set: updateQuery },
        { session: mongoTransactionSession },
      )
      .catch(
        throwCustomException('Error updating order', {
          filter,
          properties,
        }),
      );

    expectOnlySingleResult(
      [matchedCount, modifiedCount],
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
    throwIfNotFound: boolean = true,
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
      if (throwIfNotFound) {
        throwCustomException('No order found', filter)();
      }

      return;
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

    const {
      deletedCount,
    }: DeleteWriteOpResultObject = await this.orderCollection
      .deleteOne(filterQuery, {
        session: mongoTransactionSession,
      })
      .catch(throwCustomException('Error deleting order', filter));

    expectOnlySingleResult(
      [deletedCount],
      {
        operation: 'deleting',
        entity: 'order',
      },
      filter,
    );
  }

  async deleteOrders(
    orderIds: UUID[],
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    const orderMongoBinaryIds: Binary[] = orderIds.map(orderId =>
      uuidToMuuid(orderId),
    );

    const {
      deletedCount,
    }: DeleteWriteOpResultObject = await this.orderCollection
      .deleteMany(
        { _id: { $in: orderMongoBinaryIds } },
        { session: mongoTransactionSession },
      )
      .catch(throwCustomException('Error deleting many orders', { orderIds }));

    expectOnlyNResults(orderIds.length, [deletedCount], {
      operation: 'deleting',
      entity: 'order',
    });
  }

  async setItemProperties(
    orderFilter: OrderFilter,
    itemFilter: ItemFilter,
    properties: Omit<ItemFilter, 'itemId'>,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    if (
      !isNotEmptyObject(orderFilter) ||
      !isNotEmptyObject(itemFilter) ||
      !isNotEmptyObject(properties)
    ) {
      return;
    }

    const orderFilterWithId = normalizeOrderFilter(orderFilter);
    const itemFilterWithId = normalizeItemFilter(itemFilter);

    const filter = {
      ...orderFilterWithId,
      items: itemFilterWithId,
    };

    const filterQuery = {
      ...mongoQuery(orderFilterWithId),
      // https://docs.mongodb.com/manual/reference/operator/update/positional/#update-embedded-documents-using-multiple-field-matches
      items: { $elemMatch: { ...mongoQuery(itemFilterWithId) } },
    } as any;

    const itemSetQuery = mongoQuery({ 'items.$': properties });

    const {
      matchedCount,
      modifiedCount,
    }: UpdateWriteOpResult = await this.orderCollection
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
      [matchedCount, modifiedCount],
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

    const statusQuery = status
      ? {
          status: Array.isArray(status) ? { $in: status } : status,
        }
      : {};

    const itemFilterWithId = normalizeItemFilter(itemFilter);

    // const filter = {
    //   ...restOrderFilterWithId,
    //   ...statusQuery,
    //   items: { ...itemFilterWithId, receivedDate: { $ne: null } },
    // };

    const filterQuery = {
      ...mongoQuery(restOrderFilterWithId),
      ...statusQuery,
      items: {
        // For more than one item property, $elemMatch must be used:
        // https://docs.mongodb.com/manual/reference/operator/update/positional/#update-embedded-documents-using-multiple-field-matches
        $elemMatch: {
          ...mongoQuery(itemFilterWithId),
          receivedDate: { $ne: null },
        },
      },
    };

    // TODO: Error handling on photos
    const photoMuuids = photos.map(({ id }) => id);
    const photoUploadResults: ItemPhotosUploadResult = photos.map(
      ({ id, filename }) => ({
        id,
        photoName: filename,
      }),
    );

    // https://docs.mongodb.com/manual/reference/operator/update/positional/
    const {
      matchedCount,
      modifiedCount,
    }: UpdateWriteOpResult = await this.orderCollection
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
      [matchedCount, modifiedCount],
      {
        operation: 'adding photo id to',
        entity: 'order item',
      },
      {
        orderFilter,
        itemFilter: {
          ...itemFilter,
          receivedDate: 'NOT_NULL',
        },
      },
    );

    return photoUploadResults;
  }
}
