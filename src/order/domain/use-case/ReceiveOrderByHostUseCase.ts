import { UUID } from '../../../common/domain';
import { UseCase } from '../../../common/domain';

export interface ReceiveOrderByHostRequest {
  orderId: UUID;
  customerId: UUID;
}

export interface ReceiveOrderByHostResult {
  receivedByHostDate: Date;
}

export abstract class ReceiveOrderByHostUseCase extends UseCase<
  ReceiveOrderByHostRequest,
  ReceiveOrderByHostResult
> {}
