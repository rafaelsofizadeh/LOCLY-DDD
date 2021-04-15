import { Injectable } from '@nestjs/common';
import { Binary, ClientSession, Collection, UpdateQuery } from 'mongodb';
import { InjectCollection } from 'nest-mongodb';

import { UUID } from '../../../../common/domain/UUID';
import { Code } from '../../../../common/error-handling/Code';
import { Exception } from '../../../../common/error-handling/Exception';
import { OrderRepository } from '../../../application/port/OrderRepository';
import {
  EditableOrderProps,
  Order,
  OrderStatus,
} from '../../../domain/entity/Order';
import {
  OrderMongoDocument,
  draftedOrderToMongoDocument,
  mongoDocumentToOrder,
} from './OrderMongoMapper';
import { uuidToMuuid } from '../../../../common/utils';
import { ReceivedByHostOrder } from '../../../domain/entity/ReceivedByHostOrder';
import { DraftedOrder } from '../../../domain/entity/DraftedOrder';

@Injectable()
export class OrderMongoRepositoryAdapter implements OrderRepository {
  constructor(
    @InjectCollection('orders')
    private readonly orderCollection: Collection<OrderMongoDocument>,
  ) {}

  // TODO(FUTURE): Unify update (editOrder) and add (draftOrder)
  // https://docs.mongodb.com/manual/reference/method/db.collection.save/
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

  async persistOrderConfirmation(
    { id: orderId }: ConfirmedOrder,
    { id: hostId }: Host,
    transaction?: ClientSession,
  ): Promise<void> {
    await this.update(orderId, this.confirmOrderQuery(hostId), transaction);
  }

  async persistHostReceipt(
    { id: orderId, receivedByHostDate }: ReceivedByHostOrder,
    transaction?: ClientSession,
  ): Promise<void> {
    await this.update(
      orderId,
      this.receivedByHostQuery(receivedByHostDate),
      transaction,
    );
  }

  private async update(
    orderId: UUID,
    query: UpdateQuery<OrderMongoDocument>,
    transaction?: ClientSession,
  ) {
    await this.orderCollection.updateOne(
      { _id: uuidToMuuid(orderId) },
      query,
      transaction ? { session: transaction } : undefined,
    );
  }

  private addHostToOrderQuery(hostId: UUID) {
    return { hostId: uuidToMuuid(hostId) };
  }

  private updateOrderStatusQuery(status: OrderStatus) {
    return { status };
  }

  private receivedByHostQuery(receivedByHostDate: Date) {
    return {
      $set: {
        // TODO: infer the status from the Order itself
        ...this.updateOrderStatusQuery(OrderStatus.ReceivedByHost),
        ...this.receivedByHostDateQuery(receivedByHostDate),
      },
    };
  }

  private receivedByHostDateQuery(receivedByHostDate: Date) {
    return { receivedByHostDate };
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
    await this.orderCollection.deleteOne(
      { _id: uuidToMuuid(orderId) },
      transaction ? { session: transaction } : undefined,
    );
  }
}
