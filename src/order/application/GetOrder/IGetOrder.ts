import { EntityType } from '../../../auth/entity/Token';
import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Order } from '../../entity/Order';

export interface GetOrderPayload {
  readonly orderId: UUID;
  readonly userId: UUID;
  readonly userType: EntityType;
}

export abstract class IGetOrder extends UseCase<GetOrderPayload, Order> {}
