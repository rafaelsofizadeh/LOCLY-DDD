import { IsUUID, UUID } from '../../../../common/domain';
import { ReceiveOrderItemRequest } from '../../../domain/use-case/ReceiveOrderItemUseCase';

export class ReceiveOrderItemRequestAdapter implements ReceiveOrderItemRequest {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly hostId: UUID;

  @IsUUID()
  readonly itemId: UUID;
}
