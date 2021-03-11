import { ClientSession } from 'mongodb';
import { EntityId } from '../../../common/domain/EntityId';
import { Host } from '../../domain/entity/Host';
import { Order } from '../../domain/entity/Order';

export abstract class OrderRepository {
  abstract addOrder(order: Order, transaction?: ClientSession): Promise<void>;

  abstract findOrder(
    orderId: EntityId,
    transaction?: ClientSession,
  ): Promise<Order>;

  abstract findOrders(
    orderIds: EntityId[],
    transaction?: ClientSession,
  ): Promise<Order[]>;

  abstract deleteOrder(
    orderId: EntityId,
    transaction?: ClientSession,
  ): Promise<void>;

  abstract addHostToOrder(
    order: Order,
    host: Host,
    transaction?: ClientSession,
  ): Promise<void>;
}
