import { UseCase } from '../../../common/domain/UseCase';
import { EntityId } from '../../../common/domain/EntityId';

export interface ConfirmOrderRequest {
  orderId: EntityId;
}

export interface StripeCheckoutSession {
  checkoutId: string;
}

export abstract class ConfirmOrderUseCase extends UseCase<
  ConfirmOrderRequest,
  StripeCheckoutSession
> {}
