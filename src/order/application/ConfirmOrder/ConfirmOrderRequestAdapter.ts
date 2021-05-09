import { IsUUID, UUID } from '../../../common/domain';
import { ConfirmOrderRequest } from './ConfirmOrderUseCase';

export class ConfirmOrderRequestAdapter implements ConfirmOrderRequest {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly customerId: UUID;
}
