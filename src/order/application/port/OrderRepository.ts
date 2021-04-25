import { ClientSession } from 'mongodb';
import { UUID } from '../../../common/domain';
import { DraftedOrder } from '../../domain/entity/DraftedOrder';
import {
  OrderPropsWithoutId,
  Order,
  OrderStatus,
  OrderSearchRequirements,
} from '../../domain/entity/Order';

// TODO(NOW): Use customerId in methods and check document count for security
export abstract class OrderRepository {
  abstract addOrder(
    order: DraftedOrder,
    session?: ClientSession,
  ): Promise<void>;

  abstract findOrder(
    orderId: UUID,
    orderSearchRequirements?: OrderSearchRequirements,
    session?: ClientSession,
  ): Promise<Order>;

  abstract findOrders(
    orderIds: UUID[],
    session?: ClientSession,
  ): Promise<Order[]>;

  abstract deleteOrder(
    orderId: UUID,
    orderSearchRequirements?: OrderSearchRequirements,
    session?: ClientSession,
  ): Promise<void>;

  abstract setProperties(
    orderId: UUID,
    // TODO: type is almost the same as OrderSearchRequirements
    properties: Partial<OrderPropsWithoutId> & { status: OrderStatus },
    orderSearchRequirements?: OrderSearchRequirements,
    session?: ClientSession,
  ): Promise<void>;
}
