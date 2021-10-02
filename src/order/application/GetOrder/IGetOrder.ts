import { UserType } from '../../../auth/entity/Token';
import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Order } from '../../entity/Order';

export type GetOrderPayload = Readonly<{
  orderId: UUID;
  userId: UUID;
  userType: UserType;
}>;

export type GetOrderResult = Readonly<
  Omit<Order, 'initialShipmentCost' | 'customerId'> | Omit<Order, 'hostId'>
>;

export abstract class IGetOrder extends UseCase<
  GetOrderPayload,
  GetOrderResult
> {}
