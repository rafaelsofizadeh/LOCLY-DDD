import { IsUUID, UUID } from '../../../common/domain';
import { PreConfirmOrderRequest } from './PreConfirmOrderUseCase';

export class PreConfirmOrderRequestAdapter implements PreConfirmOrderRequest {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly customerId: UUID;
}
