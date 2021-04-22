import { ClientSession } from 'mongodb';
import { UUID } from '../../../common/domain/UUID';
import { DraftedOrder } from '../../domain/entity/DraftedOrder';
import {
  EditableOrderProps,
  Order,
  OrderStatus,
} from '../../domain/entity/Order';

// TODO(NOW): Use customerId in methods and check document count for security
export abstract class OrderRepository {
  abstract addOrder(
    order: DraftedOrder,
    transaction?: ClientSession,
  ): Promise<void>; // throws Code.ENTITY_NOT_FOUND

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
    properties: Partial<EditableOrderProps> & { status: OrderStatus },
    transaction?: ClientSession,
  ): Promise<void>;
}
