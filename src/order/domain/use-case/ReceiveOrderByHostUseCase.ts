import { UUID } from '../../../common/domain/UUID';
import { UseCase } from '../../../common/domain/UseCase';

export interface ReceiveOrderHostRequest {
  orderId: UUID;
}

export interface ReceiveOrderHostResult {
  receivedByHostDate: Date;
}

export abstract class ReceiveOrderHostUseCase extends UseCase<
  ReceiveOrderHostRequest,
  ReceiveOrderHostResult
> {}
