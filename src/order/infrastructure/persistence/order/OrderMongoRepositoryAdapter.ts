import { Injectable } from '@nestjs/common';
import { Binary, ClientSession, Collection, UpdateQuery } from 'mongodb';
import { InjectCollection } from 'nest-mongodb';

import { EntityId } from '../../../../common/domain/EntityId';
import { Code } from '../../../../common/error-handling/Code';
import { Exception } from '../../../../common/error-handling/Exception';
import { OrderRepository } from '../../../application/port/OrderRepository';
import {
  isDraftedOrder,
  isVerifiedByHostOrder,
  Order,
  OrderStatus,
} from '../../../domain/entity/Order';
import {
  OrderMongoDocument,
  draftedOrderToMongoDocument,
  mongoDocumentToOrder,
  DraftedOrderMongoDocument,
  VerifiedByHostOrderMongoDocumentProps,
  serializeVerifiedByHostOrderToMongoDocumentProps,
} from './OrderMongoMapper';
import { Host } from '../../../domain/entity/Host';
import { entityIdToMuuid, flattenObject } from '../../../../common/utils';
import { ReceivedByHostOrder } from '../../../domain/entity/ReceivedByHostOrder';
import { DraftedOrder } from '../../../domain/entity/DraftedOrder';
import { ConfirmedOrder } from '../../../domain/entity/ConfirmedOrder';
import { UserEditOrderRequest } from '../../../domain/use-case/EditOrderUseCase';
import { VerifiedByHostOrder } from '../../../domain/entity/VerifiedByHostOrder';
import { HostEditOrderRequest } from '../../../domain/use-case/VerifyByHostOrderUseCase';

@Injectable()
export class OrderMongoRepositoryAdapter implements OrderRepository {
  constructor(
    @InjectCollection('orders')
    private readonly orderCollection: Collection<OrderMongoDocument>,
  ) {}

  // TODO(FUTURE): Unify update (editOrder) and add (createOrder)
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

  // TODO(FUTURE): Replace all granular "persist____" methods with a single general updateOrder call.
  // TODO(FUTURE)^: Connect updateOrder with Order classes, automatically inferring changed properties.
  async updateOrder(
    order: DraftedOrder,
    editedKeys: (keyof DraftedOrder)[],
    transaction?: ClientSession,
  ): Promise<void>;
  async updateOrder(
    order: VerifiedByHostOrder,
    editedKeys: (keyof VerifiedByHostOrder)[],
    transaction?: ClientSession,
  ): Promise<void>;
  async updateOrder(
    order: DraftedOrder | VerifiedByHostOrder,
    editedKeys: Array<keyof DraftedOrder | keyof VerifiedByHostOrder>,
    transaction?: ClientSession,
  ): Promise<void> {
    let orderDocument:
      | DraftedOrderMongoDocument
      | VerifiedByHostOrderMongoDocumentProps;

    // TODO: more validation?
    if (isDraftedOrder(order)) {
      orderDocument = draftedOrderToMongoDocument(order);
    } else if (isVerifiedByHostOrder(order)) {
      orderDocument = serializeVerifiedByHostOrderToMongoDocumentProps(order);
    } else {
      throw new Error('Invalid order status.');
    }

    // TODO: key/value typing
    const editedPlainOrder = editedKeys.reduce(
      (objAcc, key) => ({
        ...objAcc,
        [key]: orderDocument[key],
      }),
      {},
    ) as
      | Partial<DraftedOrderMongoDocument>
      | Partial<VerifiedByHostOrderMongoDocumentProps>;

    await this.update(
      order.id,
      this.editOrderQuery(editedPlainOrder),
      transaction,
    );
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

  // TODO: function signature typing and keyFilter typing
  private editOrderQuery(
    editOrderPropsPlain:
      | Partial<
          Pick<
            DraftedOrderMongoDocument,
            keyof Omit<UserEditOrderRequest, 'orderId'>
          >
        >
      | Partial<
          Pick<
            VerifiedByHostOrderMongoDocumentProps,
            keyof Omit<HostEditOrderRequest, 'orderId'>
          >
        >,
  ) {
    const mongoFlattenedObjectAccessors = flattenObject(editOrderPropsPlain);

    return {
      $set: mongoFlattenedObjectAccessors,
    };
  }

  private confirmOrderQuery(hostId: EntityId): UpdateQuery<OrderMongoDocument> {
    return {
      $set: {
        ...this.updateOrderStatusQuery(OrderStatus.Confirmed),
        ...this.addHostToOrderQuery(hostId),
      },
    };
  }

  private addHostToOrderQuery(hostId: EntityId) {
    return { hostId: entityIdToMuuid(hostId) };
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
