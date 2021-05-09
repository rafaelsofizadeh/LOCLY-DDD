import { IsUUID, UUID } from '../../../common/domain';
import { PayShipmentRequest } from './PayShipmentUseCase';

export class PayShipmentRequestAdapter implements PayShipmentRequest {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly customerId: UUID;
}
