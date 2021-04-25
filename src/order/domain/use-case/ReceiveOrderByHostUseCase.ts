import { UUID } from '../../../common/domain';
import { UseCase } from '../../../common/domain';

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
