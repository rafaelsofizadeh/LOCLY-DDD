import { UseCase } from '../../../common/domain/UseCase';
import { UUID } from '../../../common/domain/UUID';

export interface ConfirmOrderRequest {
  orderId: UUID;
}

export interface StripeCheckoutSession {
  checkoutId: string;
}

export abstract class ConfirmOrderUseCase extends UseCase<
  ConfirmOrderRequest,
  StripeCheckoutSession
> {}
