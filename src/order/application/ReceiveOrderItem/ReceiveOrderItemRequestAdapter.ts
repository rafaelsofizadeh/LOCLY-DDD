import { IsUUID, UUID } from '../../../common/domain';
import { ReceiveOrderItemRequest } from './ReceiveOrderItemUseCase';

export class ReceiveOrderItemRequestAdapter implements ReceiveOrderItemRequest {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly hostId: UUID;

  @IsUUID()
  readonly itemId: UUID;
}
