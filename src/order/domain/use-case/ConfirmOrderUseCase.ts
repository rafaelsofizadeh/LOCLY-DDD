import { UseCase } from '../../../common/domain/UseCase';
import { UUID } from '../../../common/domain/UUID';

export interface ConfirmOrderRequest {
  orderId: UUID;
}

export interface StripeCheckoutSessionResult {
  checkoutId: string;
}

export abstract class ConfirmOrderUseCase extends UseCase<
  ConfirmOrderRequest,
  StripeCheckoutSessionResult
> {}
