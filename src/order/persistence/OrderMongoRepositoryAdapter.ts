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
  normalizeOrderFilter,
  normalizeItemFilter,
  FileUpload,
  FileUploadResult,
} from './OrderMongoMapper';
import {
  mongoQuery,
  muuidToUuid,
  uuidToMuuid,
  convertToMongoDocument,
  serializeMongoData,
} from '../../common/persistence';
import { ItemFilter } from '../entity/Item';
import { AddItemPhotosResult } from '../application/AddItemPhotos/IAddItemPhotos';

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
    const { status, ...restFilter } = normalizeOrderFilter(filter);
    const filterQuery: FilterQuery<OrderMongoDocument> = mongoQuery(restFilter);

    const orderDocument: OrderMongoDocument = await this.orderCollection
      .findOne(
        { ...filterQuery, ...(status && { status }) },
        { session: mongoTransactionSession },
      )
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
    photos: FileUpload[],
    mongoTransactionSession?: ClientSession,
  ): Promise<AddItemPhotosResult> {
    const { status, ...restOrderFilterWithId } = normalizeOrderFilter(
      orderFilter,
    );

    const itemFilterWithId = normalizeItemFilter(itemFilter);

    const filterQuery = {
      ...mongoQuery(restOrderFilterWithId),
      ...(status && { status }),
      items: {
        // For more than one item property, $elemMatch must be used:
        // https://docs.mongodb.com/manual/reference/operator/update/positional/#update-embedded-documents-using-multiple-field-matches
        $elemMatch: mongoQuery(itemFilterWithId),
      },
    };

    // TODO: Error handling on photos
    const photoMuuids = photos.map(({ id }) => id);
    const photoUploadResults: AddItemPhotosResult = photos.map(
      ({ id, filename }) => ({
        id: muuidToUuid(id),
        name: filename,
      }),
    );

    const {
      matchedCount,
      modifiedCount,
    }: UpdateWriteOpResult = await this.orderCollection
      .updateOne(
        filterQuery,
        {
          $push: {
            // $ – positional: https://docs.mongodb.com/manual/reference/operator/update/positional/
            'items.$.photoIds': {
              // $each: https://docs.mongodb.com/manual/reference/operator/update/push/#append-multiple-values-to-an-array
              $each: photoMuuids,
            },
          },
        },
        { session: mongoTransactionSession },
      )
      .catch(
        throwCustomException('Error adding photo file id to order item', {
          orderFilter,
          itemFilter,
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
        itemFilter,
      },
    );

    return photoUploadResults;
  }

  async addFile(
    orderFilter: OrderFilter,
    file: FileUpload,
    mongoTransactionSession?: ClientSession,
  ): Promise<FileUploadResult> {
    const { status, ...restNormalizedOrderFilter } = normalizeOrderFilter(
      orderFilter,
    );

    const filterQuery = {
      ...mongoQuery(restNormalizedOrderFilter),
      ...(status && { status }),
    };

    // TODO: Error handling on file
    const fileUploadResult: FileUploadResult = {
      id: muuidToUuid(file.id),
      name: file.filename,
    };

    const {
      matchedCount,
      modifiedCount,
    }: UpdateWriteOpResult = await this.orderCollection
      .updateOne(
        filterQuery,
        {
          $set: { proofOfPayment: fileUploadResult.id },
        },
        { session: mongoTransactionSession },
      )
      .catch(
        throwCustomException('Error adding file id to order', {
          orderFilter,
        }),
      );

    expectOnlySingleResult(
      [matchedCount, modifiedCount],
      {
        operation: 'adding file id to',
        entity: 'order',
      },
      {
        orderFilter,
      },
    );

    return fileUploadResult;
  }
}
