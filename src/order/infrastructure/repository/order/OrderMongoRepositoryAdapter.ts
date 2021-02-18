import * as MUUID from 'uuid-mongodb';
import { Injectable } from '@nestjs/common';
import { Binary, Collection } from 'mongodb';
import { InjectCollection } from 'nest-mongodb';

import { EntityId } from '../../../../common/domain/EntityId';
import { Code } from '../../../../common/error-handling/Code';
import { Exception } from '../../../../common/error-handling/Exception';
import { OrderRepository } from '../../../application/port/OrderRepository';
import { Order } from '../../../domain/entity/Order';
import {
  mongoDocumentToOrder,
  OrderMongoDocument,
  orderToMongoDocument,
} from './OrderMongoMapper';
import { Host } from '../../../domain/entity/Host';

@Injectable()
export class OrderMongoRepositoryAdapter implements OrderRepository {
  constructor(
    @InjectCollection('orders')
    private readonly orderCollection: Collection<OrderMongoDocument>,
  ) {}

  async addOrder(order: Order): Promise<void> {
    const orderDocument = orderToMongoDocument(order);

    this.orderCollection.insertOne(orderDocument).catch(error => {
      throw new Exception(
        Code.INTERNAL_ERROR,
        `Error creating a new order in the database. ${error.name}: ${error.message}`,
        { order, orderDocument },
      );
    });
  }

  // TODO: This should always be used together with HostRepository.addOrderToHost
  async addHostToOrder(
    { id: orderId }: Order,
    { id: hostId }: Host,
  ): Promise<void> {
    this.orderCollection.updateOne(
      { _id: MUUID.from(orderId.value) },
      { $set: { hostId: MUUID.from(hostId.value) } },
    );
  }

  async findOrder(orderId: EntityId): Promise<Order> {
    const orderDocument: OrderMongoDocument = await this.orderCollection.findOne(
      {
        _id: MUUID.from(orderId.value),
      },
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

  async findOrders(orderIds: EntityId[]): Promise<Order[]> {
    const orderMongoBinaryIds: Binary[] = orderIds.map(({ value }) =>
      MUUID.from(value),
    );

    const orderDocuments: OrderMongoDocument[] = await this.orderCollection
      .find({ _id: { $in: orderMongoBinaryIds } })
      .toArray();

    // TODO: Still pass successfulOrderIds further?
    if (orderDocuments.length !== orderIds.length) {
      const failedOrderIds: EntityId[] = orderIds.filter(
        orderId =>
          orderDocuments.findIndex(
            orderDocument => MUUID.from(orderId.value) === orderDocument._id,
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

  async deleteOrder(orderId: EntityId): Promise<void> {
    this.orderCollection.deleteOne({ _id: MUUID.from(orderId.value) });
  }
}
