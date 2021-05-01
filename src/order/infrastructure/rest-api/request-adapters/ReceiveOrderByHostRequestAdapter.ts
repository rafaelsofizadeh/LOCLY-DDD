import { IsUUID, UUID } from '../../../../common/domain';
import { ReceiveOrderByHostRequest } from '../../../domain/use-case/ReceiveOrderByHostUseCase';

export class ReceiveOrderByHostRequestAdapter
  implements ReceiveOrderByHostRequest {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly customerId: UUID;
}
