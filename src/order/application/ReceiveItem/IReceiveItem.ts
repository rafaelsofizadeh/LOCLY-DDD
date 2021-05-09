import { UseCase } from '../../../common/application';
import { IsUUID, UUID } from '../../../common/domain';

export interface ReceiveItemRequest {
  readonly orderId: UUID;
  readonly hostId: UUID;
  readonly itemId: UUID;
}

export class ReceiveItemRequest implements ReceiveItemRequest {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly hostId: UUID;

  @IsUUID()
  readonly itemId: UUID;
}

export interface ReceiveItemResult {
  receivedDate: Date;
}

export abstract class IReceiveItem extends UseCase<
  ReceiveItemRequest,
  ReceiveItemResult
> {}
