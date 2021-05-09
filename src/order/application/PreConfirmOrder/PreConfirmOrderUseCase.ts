
import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';

export interface PreConfirmOrderRequest {
  orderId: UUID;
  customerId: UUID;
}

export interface StripeCheckoutSessionResult {
  checkoutId: string;
}

export abstract class PreConfirmOrderUseCase extends UseCase<
  PreConfirmOrderRequest,
  StripeCheckoutSessionResult
> {}
