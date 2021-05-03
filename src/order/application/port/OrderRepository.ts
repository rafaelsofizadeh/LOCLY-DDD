import { ClientSession } from 'mongodb';
import { UUID, WithoutId } from '../../../common/domain';
import { DraftOrder } from '../../domain/entity/DraftOrder';
import { Order, OrderFilter } from '../../domain/entity/Order';

export abstract class OrderRepository {
  abstract addOrder(order: DraftOrder, session?: ClientSession): Promise<void>;

  abstract findOrder(
    filter: OrderFilter,
    session?: ClientSession,
  ): Promise<Order>;

  abstract findOrders(
    orderIds: UUID[],
    session?: ClientSession,
  ): Promise<Order[]>;

  abstract deleteOrder(
    filter: OrderFilter,
    session?: ClientSession,
  ): Promise<void>;

  abstract setProperties(
    filter: OrderFilter,
    // TODO: type is almost the same as OrderFilter
    properties: WithoutId<OrderFilter>,
    session?: ClientSession,
  ): Promise<void>;
}
