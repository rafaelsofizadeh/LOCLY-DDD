import { ClientSession } from 'mongodb';
import { EntityId } from '../../../common/domain/EntityId';
import { ConfirmedOrder } from '../../domain/entity/ConfirmedOrder';
import { DraftedOrder } from '../../domain/entity/DraftedOrder';
import { Host } from '../../domain/entity/Host';
import { Order } from '../../domain/entity/Order';
import { VerifiedByHostOrder } from '../../domain/entity/VerifiedByHostOrder';
import { UserEditOrderRequest } from '../../domain/use-case/EditOrderUseCase';
import { HostEditOrderRequest } from '../../domain/use-case/VerifyByHostOrderUseCase';

export abstract class OrderRepository {
  abstract addOrder(
    order: DraftedOrder,
    transaction?: ClientSession,
  ): Promise<void>;

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

  abstract updateOrder(
    order: DraftedOrder | VerifiedByHostOrder,
    editedKeys: (keyof DraftedOrder)[] | (keyof VerifiedByHostOrder)[],
    transaction?: ClientSession,
  ): Promise<void>;

  abstract persistOrderConfirmation(
    order: ConfirmedOrder,
    host: Host,
    transaction?: ClientSession,
  ): Promise<void>;

  abstract persistHostReceipt(
    order: Order,
    transaction?: ClientSession,
  ): Promise<void>;
}
