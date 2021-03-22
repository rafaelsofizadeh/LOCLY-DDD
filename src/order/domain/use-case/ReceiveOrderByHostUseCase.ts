import { EntityId } from '../../../common/domain/EntityId';
import { UseCase } from '../../../common/domain/UseCase';

export interface ReceiveOrderHostRequest {
  orderId: EntityId;
}

export interface ReceiveOrderHostResult {
  receivedByHostDate: Date;
}

export abstract class ReceiveOrderHostUseCase extends UseCase<
  ReceiveOrderHostRequest,
  ReceiveOrderHostResult
> {}
