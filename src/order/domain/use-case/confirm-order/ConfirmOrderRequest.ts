import { EntityId } from '../../../../common/domain/EntityId';

export interface ConfirmOrderRequest {
  orderId: EntityId;
}
