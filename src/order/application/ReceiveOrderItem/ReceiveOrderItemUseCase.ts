import { UUID } from '../../../common/domain';
import { UseCase } from '../../../common/domain';

export interface ReceiveOrderItemRequest {
  orderId: UUID;
  hostId: UUID;
  itemId: UUID;
}

export interface ReceiveOrderItemResult {
  receivedDate: Date;
}

export abstract class ReceiveOrderItemUseCase extends UseCase<
  ReceiveOrderItemRequest,
  ReceiveOrderItemResult
> {}
