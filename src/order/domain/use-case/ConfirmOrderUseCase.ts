import { UseCase } from '../../../common/domain/UseCase';
import { EntityId } from '../../../common/domain/EntityId';

export interface ConfirmOrderRequest {
  orderId: EntityId;
}

export interface ConfirmOrderResult {
  checkoutId: string;
}

export abstract class ConfirmOrderUseCase extends UseCase<
  ConfirmOrderRequest,
  ConfirmOrderResult
> {}
