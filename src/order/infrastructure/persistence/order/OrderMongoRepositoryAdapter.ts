import { HttpStatus, Injectable } from '@nestjs/common';
import {
  Binary,
  ClientSession,
  Collection,
  DeleteWriteOpResultObject,
  FilterQuery,
} from 'mongodb';
import { InjectCollection } from 'nest-mongodb';

import { UUID } from '../../../../common/domain';
import { Exception } from '../../../../common/error-handling';
import { OrderRepository } from '../../../application/port/OrderRepository';
import {
  OrderPropsWithoutId,
  Order,
  OrderSearchRequirements,
  OrderStatus,
} from '../../../domain/entity/Order';
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
      .catch(error => {
        throw new Exception(
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error creating a new draftedOrder in the database. ${error.name}: ${error.message}`,
          { draftedOrder, draftedOrderDocument },
        );
      });
  }

  async setProperties(
    orderId: UUID,
    properties: Partial<OrderPropsWithoutId> & { status: OrderStatus },
    orderSearchRequirements: OrderSearchRequirements = {},
    session?: ClientSession,
  ) {
    await this.orderCollection.updateOne(
      this.mongoFilterQuery(orderId, orderSearchRequirements),
      { $set: convertToMongoDocument(properties) },
      { session },
    );
  }

  async findOrder(
    orderId: UUID,
    orderSearchRequirements: OrderSearchRequirements = {},
    session?: ClientSession,
  ): Promise<Order> {
    const filterQuery: FilterQuery<OrderMongoDocument> = this.mongoFilterQuery(
      orderId,
      orderSearchRequirements,
    );

    const orderDocument: OrderMongoDocument = await this.orderCollection.findOne(
      filterQuery,
      { session },
    );

    if (!orderDocument) {
      console.log(filterQuery._id, filterQuery._id.toString());

      throw new Exception(
        HttpStatus.NOT_FOUND,
        `Order (id: ${orderId}) not found`,
        { orderId, orderSearchRequirements, filterQuery },
      );
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

      throw new Exception(
        HttpStatus.NOT_FOUND,
        `Orders (ids: ${failedOrderIds.join(', ')}) not found`,
        { orderIds, failedOrderIds },
      );
    }

    return orderDocuments.map(orderDocument =>
      mongoDocumentToOrder(orderDocument),
    );
  }

  async deleteOrder(
    orderId: UUID,
    orderSearchRequirements: OrderSearchRequirements = {},
    session?: ClientSession,
  ): Promise<void> {
    const deleteResult: DeleteWriteOpResultObject = await this.orderCollection.deleteOne(
      this.mongoFilterQuery(orderId, orderSearchRequirements),
      { session },
    );

    if (deleteResult.deletedCount !== 1) {
      throw new Exception(
        HttpStatus.NOT_FOUND,
        `Cannot delete, order (id: ${orderId}}) not found`,
        { orderId },
      );
    }
  }

  // TODO: Better typing (usage of FilterQuery)
  private mongoFilterQuery(
    orderId: UUID,
    orderSearchRequirements: OrderSearchRequirements = {},
  ): FilterQuery<OrderMongoDocument> {
    return convertToMongoDocument({ id: orderId, ...orderSearchRequirements });
  }
}
