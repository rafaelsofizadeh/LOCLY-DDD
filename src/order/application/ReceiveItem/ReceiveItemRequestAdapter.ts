import { IsUUID, UUID } from '../../../common/domain';
import { ReceiveItemRequest } from './ReceiveItemUseCase';

export class ReceiveItemRequestAdapter implements ReceiveItemRequest {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly hostId: UUID;

  @IsUUID()
  readonly itemId: UUID;
}
