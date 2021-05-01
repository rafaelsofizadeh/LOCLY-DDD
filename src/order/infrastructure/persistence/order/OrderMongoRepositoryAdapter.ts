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

import { UUID, WithoutId } from '../../../../common/domain';
import {
  expectOnlySingleResult,
  throwCustomException,
} from '../../../../common/error-handling';
import { OrderRepository } from '../../../application/port/OrderRepository';
import { Order, OrderFilter, OrderStatus } from '../../../domain/entity/Order';
import {
  OrderMongoDocument,
  draftedOrderToMongoDocument,
  mongoDocumentToOrder,
} from './OrderMongoMapper';
import { DraftedOrder } from '../../../domain/entity/DraftedOrder';
import {
  convertToMongoDocument,
  uuidToMuuid,
} from '../../../../common/persistence';

@Injectable()
export class OrderMongoRepositoryAdapter implements OrderRepository {
  constructor(
    @InjectCollection('orders')
    private readonly orderCollection: Collection<OrderMongoDocument>,
  ) {}

  async addOrder(
    draftedOrder: DraftedOrder,
    session?: ClientSession,
  ): Promise<void> {
    const draftedOrderDocument = draftedOrderToMongoDocument(draftedOrder);

    await this.orderCollection
      .insertOne(draftedOrderDocument, { session })
      .catch(
        throwCustomException(
          'Error creating a new draftedOrder in the database',
          { draftedOrder, draftedOrderDocument },
        ),
      );
  }

  async setProperties(
    orderFilter: OrderFilter,
    // TODO: better type naming for OrderFilter here
    properties: WithoutId<OrderFilter>,
    session?: ClientSession,
  ) {
    const updateResult: UpdateWriteOpResult = await this.orderCollection
      .updateOne(
        convertToMongoDocument(orderFilter),
        { $set: convertToMongoDocument(properties) },
        { session },
      )
      .catch(
        throwCustomException('Error updating order', {
          orderId: orderFilter.id,
          properties,
          orderFilter,
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
    orderFilter: OrderFilter,
    session?: ClientSession,
  ): Promise<Order> {
    // TODO: better typing using FilterQuery
    const filterQuery: FilterQuery<OrderMongoDocument> = convertToMongoDocument(
      orderFilter,
    );

    const orderDocument: OrderMongoDocument = await this.orderCollection
      .findOne(filterQuery, { session })
      .catch(
        throwCustomException('Error searching for an order', {
          orderId: orderFilter.id,
          orderFilter,
        }),
      );

    if (!orderDocument) {
      throwCustomException('No order found', {
        orderId: orderFilter.id,
        orderFilter,
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
    orderFilter: OrderFilter,
    session?: ClientSession,
  ): Promise<void> {
    const deleteResult: DeleteWriteOpResultObject = await this.orderCollection
      .deleteOne(convertToMongoDocument(orderFilter), {
        session,
      })
      .catch(
        throwCustomException('Error deleting order', {
          orderId: orderFilter.id,
          orderFilter,
        }),
      );

    expectOnlySingleResult([deleteResult.deletedCount], {
      operation: 'deleting',
      entity: 'order',
    });
  }
}
