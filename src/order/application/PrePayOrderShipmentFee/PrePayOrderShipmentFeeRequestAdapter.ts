import { IsUUID, UUID } from '../../../common/domain';
import { PrePayOrderShipmentFeeRequest } from './PrePayOrderShipmentFeeUseCase';

export class PrePayOrderShipmentFeeRequestAdapter
  implements PrePayOrderShipmentFeeRequest {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly customerId: UUID;
}
