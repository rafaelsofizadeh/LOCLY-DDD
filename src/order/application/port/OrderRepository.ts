import { ClientSession } from 'mongodb';
import { UUID } from '../../../common/domain/UUID';
import { DraftedOrder } from '../../domain/entity/DraftedOrder';
import { EditableOrderProps, Order } from '../../domain/entity/Order';

export abstract class OrderRepository {
  abstract addOrder(
    order: DraftedOrder,
    transaction?: ClientSession,
  ): Promise<void>;

  abstract findOrder(
    orderId: UUID,
    transaction?: ClientSession,
  ): Promise<Order>;

  abstract findOrders(
    orderIds: UUID[],
    transaction?: ClientSession,
  ): Promise<Order[]>;

  abstract deleteOrder(
    orderId: UUID,
    transaction?: ClientSession,
  ): Promise<void>;

  abstract setProperties(
    orderId: UUID,
    properties: Partial<EditableOrderProps>,
    transaction?: ClientSession,
  ): Promise<void>;

  abstract persistHostReceipt(
    order: Order,
    transaction?: ClientSession,
  ): Promise<void>;
}
