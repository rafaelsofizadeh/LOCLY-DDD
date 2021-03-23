import { Injectable } from '@nestjs/common';
import { Binary, ClientSession, Collection, UpdateQuery } from 'mongodb';
import { InjectCollection } from 'nest-mongodb';

import { EntityId } from '../../../../common/domain/EntityId';
import { Code } from '../../../../common/error-handling/Code';
import { Exception } from '../../../../common/error-handling/Exception';
import { OrderRepository } from '../../../application/port/OrderRepository';
import { Order, OrderStatus } from '../../../domain/entity/Order';
import {
  mongoDocumentToOrder,
  OrderMongoDocument,
  orderToMongoDocument,
} from './OrderMongoMapper';
import { Host } from '../../../domain/entity/Host';
import { entityIdToMuuid } from '../../../../common/utils';

@Injectable()
export class OrderMongoRepositoryAdapter implements OrderRepository {
  constructor(
    @InjectCollection('orders')
    private readonly orderCollection: Collection<OrderMongoDocument>,
  ) {}

  async addOrder(order: Order, transaction?: ClientSession): Promise<void> {
    const orderDocument = orderToMongoDocument(order);

    await this.orderCollection
      .insertOne(
        orderDocument,
        transaction ? { session: transaction } : undefined,
      )
      .catch(error => {
        throw new Exception(
          Code.INTERNAL_ERROR,
          `Error creating a new order in the database. ${error.name}: ${error.message}`,
          { order, orderDocument },
        );
      });
  }

  async persistOrderConfirmation(
    { id: orderId, status }: Order,
    { id: hostId }: Host,
    transaction?: ClientSession,
  ): Promise<void> {
    await this.update(
      orderId,
      this.confirmOrderQuery(status, hostId),
      transaction,
    );
  }

  async persistHostReceipt(
    { id: orderId, status, receivedByHostDate }: Order,
    transaction?: ClientSession,
  ): Promise<void> {
    await this.update(
      orderId,
      this.receivedByHostQuery(status, receivedByHostDate),
      transaction,
    );
  }

  private async update(
    orderId: EntityId,
    query: UpdateQuery<OrderMongoDocument>,
    transaction?: ClientSession,
  ) {
    await this.orderCollection.updateOne(
      { _id: entityIdToMuuid(orderId) },
      query,
      transaction ? { session: transaction } : undefined,
    );
  }

  private confirmOrderQuery(
    status: OrderStatus,
    hostId: EntityId,
  ): UpdateQuery<OrderMongoDocument> {
    return {
      $set: {
        ...this.updateOrderStatusQuery(status),
        ...this.addHostToOrderQuery(hostId),
      },
    };
  }

  private addHostToOrderQuery(hostId: EntityId): { hostId: Binary } {
    return { hostId: entityIdToMuuid(hostId) };
  }

  private updateOrderStatusQuery(status: OrderStatus): { status: OrderStatus } {
    return { status };
  }

  private receivedByHostQuery(status: OrderStatus, receivedByHostDate: Date) {
    return {
      $set: {
        ...this.updateOrderStatusQuery(status),
        ...this.receivedByHostDateQuery(receivedByHostDate),
      },
    };
  }

  private receivedByHostDateQuery(receivedByHostDate: Date) {
    return { receivedByHostDate };
  }

  async findOrder(
    orderId: EntityId,
    transaction?: ClientSession,
  ): Promise<Order> {
    const orderDocument: OrderMongoDocument = await this.orderCollection.findOne(
      {
        _id: entityIdToMuuid(orderId),
      },
      transaction ? { session: transaction } : undefined,
    );

    if (!orderDocument) {
      throw new Exception(
        Code.ENTITY_NOT_FOUND_ERROR,
        `Order (id: ${orderId.value}) not found`,
        { orderId },
      );
    }

    return mongoDocumentToOrder(orderDocument);
  }

  async findOrders(
    orderIds: EntityId[],
    transaction?: ClientSession,
  ): Promise<Order[]> {
    const orderMongoBinaryIds: Binary[] = orderIds.map(orderId =>
      entityIdToMuuid(orderId),
    );

    const orderDocuments: OrderMongoDocument[] = await this.orderCollection
      .find(
        { _id: { $in: orderMongoBinaryIds } },
        transaction ? { session: transaction } : undefined,
      )
      .toArray();

    // To access all orderIds and failedOrderIds, catch the exception and access its 'data' property
    if (orderDocuments.length !== orderIds.length) {
      const failedOrderIds: EntityId[] = orderIds.filter(
        orderId =>
          orderDocuments.findIndex(
            orderDocument => entityIdToMuuid(orderId) === orderDocument._id,
          ) === -1,
      );

      throw new Exception(
        Code.ENTITY_NOT_FOUND_ERROR,
        `Orders (ids: ${failedOrderIds
          .map(({ value }) => value)
          .join(', ')}) not found`,
        { orderIds, failedOrderIds },
      );
    }

    return orderDocuments.map(orderDocument =>
      mongoDocumentToOrder(orderDocument),
    );
  }

  async deleteOrder(
    orderId: EntityId,
    transaction?: ClientSession,
  ): Promise<void> {
    await this.orderCollection.deleteOne(
      { _id: entityIdToMuuid(orderId) },
      transaction ? { session: transaction } : undefined,
    );
  }
}
