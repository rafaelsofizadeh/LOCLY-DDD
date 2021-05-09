import { IsUUID, UUID } from '../../../common/domain';
import { DeleteOrderRequest } from './DeleteOrderUseCase';

export class DeleteOrderRequestAdapter implements DeleteOrderRequest {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly customerId: UUID;
}
