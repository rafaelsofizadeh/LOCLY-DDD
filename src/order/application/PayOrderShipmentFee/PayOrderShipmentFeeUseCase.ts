import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';

export interface PayOrderShipmentFeeRequest {
  orderId: UUID;
  customerId: UUID;
}

export interface StripeCheckoutSessionResult {
  checkoutId: string;
}

export abstract class PayOrderShipmentFeeUseCase extends UseCase<
  PayOrderShipmentFeeRequest,
  StripeCheckoutSessionResult
> {}
