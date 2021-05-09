import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';

export interface ConfirmOrderRequest {
  orderId: UUID;
  customerId: UUID;
}

export interface StripeCheckoutSessionResult {
  checkoutId: string;
}

export abstract class ConfirmOrderUseCase extends UseCase<
  ConfirmOrderRequest,
  StripeCheckoutSessionResult
> {}
