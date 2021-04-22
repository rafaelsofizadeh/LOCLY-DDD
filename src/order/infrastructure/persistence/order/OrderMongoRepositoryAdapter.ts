import { Injectable } from '@nestjs/common';
import {
  Binary,
  ClientSession,
  Collection,
  DeleteWriteOpResultObject,
} from 'mongodb';
import { InjectCollection } from 'nest-mongodb';

import { UUID } from '../../../../common/domain/UUID';
import { Code } from '../../../../common/error-handling/Code';
import { Exception } from '../../../../common/error-handling/Exception';
import { OrderRepository } from '../../../application/port/OrderRepository';
import { EditableOrderProps, Order } from '../../../domain/entity/Order';
import {
  OrderMongoDocument,
  draftedOrderToMongoDocument,
  mongoDocumentToOrder,
} from './OrderMongoMapper';
import { uuidToMuuid } from '../../../../common/utils';
import { DraftedOrder } from '../../../domain/entity/DraftedOrder';
import { convertToMongoDocument } from '../utils';

@Injectable()
export class OrderMongoRepositoryAdapter implements OrderRepository {
  constructor(
    @InjectCollection('orders')
    private readonly orderCollection: Collection<OrderMongoDocument>,
  ) {}

  async addOrder(
    draftedOrder: DraftedOrder,
    transaction?: ClientSession,
  ): Promise<void> {
    const draftedOrderDocument = draftedOrderToMongoDocument(draftedOrder);

    await this.orderCollection
      .insertOne(
        draftedOrderDocument,
        transaction ? { session: transaction } : undefined,
      )
      .catch(error => {
        throw new Exception(
          Code.INTERNAL_ERROR,
          `Error creating a new draftedOrder in the database. ${error.name}: ${error.message}`,
          { draftedOrder, draftedOrderDocument },
        );
      });
  }

  async setProperties(
    orderId: UUID,
    properties: Partial<EditableOrderProps>,
    transaction?: ClientSession,
  ) {
    await this.orderCollection.updateOne(
      { _id: uuidToMuuid(orderId) },
      { $set: convertToMongoDocument(properties) },
      transaction ? { session: transaction } : undefined,
    );
  }

  async findOrder(orderId: UUID, transaction?: ClientSession): Promise<Order> {
    const orderDocument: OrderMongoDocument = await this.orderCollection.findOne(
      {
        _id: uuidToMuuid(orderId),
      },
      transaction ? { session: transaction } : undefined,
    );

    if (!orderDocument) {
      throw new Exception(
        Code.ENTITY_NOT_FOUND_ERROR,
        `Order (id: ${orderId}) not found`,
        { orderId },
      );
    }

    return mongoDocumentToOrder(orderDocument);
  }

  async findOrders(
    orderIds: UUID[],
    transaction?: ClientSession,
  ): Promise<Order[]> {
    const orderMongoBinaryIds: Binary[] = orderIds.map(orderId =>
      uuidToMuuid(orderId),
    );

    const orderDocuments: OrderMongoDocument[] = await this.orderCollection
      .find(
        { _id: { $in: orderMongoBinaryIds } },
        transaction ? { session: transaction } : undefined,
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

      throw new Exception(
        Code.ENTITY_NOT_FOUND_ERROR,
        `Orders (ids: ${failedOrderIds.join(', ')}) not found`,
        { orderIds, failedOrderIds },
      );
    }

    return orderDocuments.map(orderDocument =>
      mongoDocumentToOrder(orderDocument),
    );
  }

  async deleteOrder(orderId: UUID, transaction?: ClientSession): Promise<void> {
    const deleteResult: DeleteWriteOpResultObject = await this.orderCollection.deleteOne(
      { _id: uuidToMuuid(orderId) },
      transaction ? { session: transaction } : undefined,
    );

    if (deleteResult.deletedCount !== 1) {
      throw new Exception(
        Code.ENTITY_NOT_FOUND_ERROR,
        `Cannot delete, order (id: ${orderId}}) not found`,
        { orderId },
      );
    }
  }
}
