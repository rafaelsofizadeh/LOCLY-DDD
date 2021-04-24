import { IsUUID, UUID } from '../../../common/domain/UUID';
import { PreConfirmOrderRequest } from '../../domain/use-case/PreConfirmOrderUseCase';

export class PreConfirmOrderRequestAdapter implements PreConfirmOrderRequest {
  @IsUUID()
  readonly orderId: UUID;
}
