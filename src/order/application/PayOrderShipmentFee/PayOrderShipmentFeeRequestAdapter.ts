import { IsUUID, UUID } from '../../../common/domain';
import { PayOrderShipmentFeeRequest } from './PayOrderShipmentFeeUseCase';

export class PayOrderShipmentFeeRequestAdapter
  implements PayOrderShipmentFeeRequest {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly customerId: UUID;
}
