import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';

export interface ReceiveItemRequest {
  orderId: UUID;
  hostId: UUID;
  itemId: UUID;
}

export interface ReceiveItemResult {
  receivedDate: Date;
}

export abstract class ReceiveItemUseCase extends UseCase<
  ReceiveItemRequest,
  ReceiveItemResult
> {}
