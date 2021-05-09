import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';

export interface PayShipmentRequest {
  orderId: UUID;
  customerId: UUID;
}

export interface StripeCheckoutSessionResult {
  checkoutId: string;
}

export abstract class PayShipmentUseCase extends UseCase<
  PayShipmentRequest,
  StripeCheckoutSessionResult
> {}
