import { UseCase } from '../../../common/domain/UseCase';
import { UUID } from '../../../common/domain/UUID';

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
