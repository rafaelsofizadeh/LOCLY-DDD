import { IsUUID, UUID } from '../../../../common/domain';
import { PreConfirmOrderRequest } from '../../../domain/use-case/PreConfirmOrderUseCase';

export class PreConfirmOrderRequestAdapter implements PreConfirmOrderRequest {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly customerId: UUID;
}
