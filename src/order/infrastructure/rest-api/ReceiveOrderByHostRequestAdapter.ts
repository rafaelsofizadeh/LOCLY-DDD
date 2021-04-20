import { IsUUID, UUID } from '../../../common/domain/UUID';
import { ReceiveOrderHostRequest } from '../../domain/use-case/ReceiveOrderByHostUseCase';

export class ReceiveOrderHostRequestAdapter implements ReceiveOrderHostRequest {
  @IsUUID()
  readonly orderId: UUID;
}
