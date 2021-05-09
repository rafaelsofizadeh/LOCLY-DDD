import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';

export interface PrePayOrderShipmentFeeRequest {
  orderId: UUID;
  customerId: UUID;
}

export interface StripeCheckoutSessionResult {
  checkoutId: string;
}

export abstract class PrePayOrderShipmentFeeUseCase extends UseCase<
  PrePayOrderShipmentFeeRequest,
  StripeCheckoutSessionResult
> {}
