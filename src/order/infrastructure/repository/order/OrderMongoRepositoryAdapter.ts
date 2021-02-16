import { Injectable } from '@nestjs/common';
import * as MUUID from 'uuid-mongodb';
import { Binary, Collection } from 'mongodb';
import { InjectCollection } from 'nest-mongodb';

import { EntityId } from '../../../../common/domain/EntityId';
import { Code } from '../../../../common/error-handling/Code';
import { Exception } from '../../../../common/error-handling/Exception';
import { OrderRepository } from '../../../application/port/OrderRepository';
import { Order } from '../../../domain/entity/Order';
import { CustomerRepository } from '../../../application/port/CustomerRepository';
import { Customer } from '../../../domain/entity/Customer';
import { muuidToEntityId } from '../../../../common/utils';
import {
  mongoDocumentToOrder,
  OrderMongoDocument,
  orderToMongoDocument,
  PopulatedOrderMongoDocument,
} from './OrderMongoMapper';

// TODO: mongoDocumentToXXX to a decorator
@Injectable()
export class OrderMongoRepositoryAdapter implements OrderRepository {
  constructor(
    @InjectCollection('orders')
    private readonly orderCollection: Collection<OrderMongoDocument>,
    private readonly customerRepository: CustomerRepository,
  ) {}

  async addOrder(order: Order): Promise<void> {
    const orderDocument = orderToMongoDocument(order);

    await this.orderCollection.insertOne(orderDocument).catch(error => {
      throw new Exception(
        Code.INTERNAL_ERROR,
        `Error creating a new order in the database. ${error.name}: ${error.message}`,
        { order, orderDocument },
      );
    });
  }

  // TODO: Should populate hosts too
  async findOrder(orderId: EntityId): Promise<Order> {
    const {
      customerId,
      ...sanitizedOrderDocument
    }: OrderMongoDocument = await this.orderCollection.findOne({
      _id: MUUID.from(orderId.value),
    });

    if (!sanitizedOrderDocument) {
      throw new Exception(
        Code.ENTITY_NOT_FOUND_ERROR,
        `Order (id: ${orderId.value}) not found`,
        { orderId },
      );
    }

    const orderCustomer: Customer = await this.customerRepository.findCustomer(
      muuidToEntityId(customerId),
    );

    return mongoDocumentToOrder({
      ...sanitizedOrderDocument,
      customer: orderCustomer,
    });
  }

  // TODO: Should populate hosts too
  async findOrders(orderIds: EntityId[]): Promise<Order[]> {
    const orderMUUIDs: Binary[] = orderIds.map(({ value }) =>
      MUUID.from(value),
    );

    const orderDocuments: OrderMongoDocument[] = await this.orderCollection
      .find({ _id: { $in: orderMUUIDs } })
      .toArray();

    // TODO(NOW): ERROR HERE, in createHosts too
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

    const populatedOrderDocuments: PopulatedOrderMongoDocument[] = await Promise.all(
      orderDocuments.map(async orderDocument => {
        const orderCustomer: Customer = await this.customerRepository.findCustomer(
          muuidToEntityId(orderDocument.customerId),
        );

        const { customerId, ...sanitizedOrderDocument } = orderDocument;

        return {
          ...sanitizedOrderDocument,
          customer: orderCustomer,
        };
      }),
    );

    return populatedOrderDocuments.map(populatedOrderDocument =>
      mongoDocumentToOrder(populatedOrderDocument),
    );
  }

  async deleteOrder(orderId: EntityId): Promise<void> {
    this.orderCollection.deleteOne({ _id: MUUID.from(orderId.value) });
  }
}
