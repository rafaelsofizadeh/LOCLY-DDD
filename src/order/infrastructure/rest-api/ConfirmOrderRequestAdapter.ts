import { IsUUID, UUID } from '../../../common/domain/UUID';
import { ConfirmOrderRequest } from '../../domain/use-case/ConfirmOrderUseCase';

export class ConfirmOrderRequestAdapter implements ConfirmOrderRequest {
  @IsUUID()
  readonly orderId: UUID;
}
