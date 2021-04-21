import { ClientSession } from 'mongodb';
import { UUID } from '../../../../common/domain/UUID';
import { DraftedOrder } from '../../../domain/entity/DraftedOrder';
import { Order } from '../../../domain/entity/Order';

export abstract class TestOrderRepository {
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
}
