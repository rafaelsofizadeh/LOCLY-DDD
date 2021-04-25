import { UseCase } from '../../../common/domain';
import { UUID } from '../../../common/domain';

export interface PreConfirmOrderRequest {
  orderId: UUID;
}

export interface StripeCheckoutSessionResult {
  checkoutId: string;
}

export abstract class PreConfirmOrderUseCase extends UseCase<
  PreConfirmOrderRequest,
  StripeCheckoutSessionResult
> {}
