import { UseCase } from '../../../common/application';
import { IsUUID, UUID } from '../../../common/domain';

export interface PayShipmentRequest {
  orderId: UUID;
  customerId: UUID;
}

export class PayShipmentRequestAdapter implements PayShipmentRequest {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly customerId: UUID;
}

export interface StripeCheckoutSessionResult {
  checkoutId: string;
}

export abstract class PayShipmentUseCase extends UseCase<
  PayShipmentRequest,
  StripeCheckoutSessionResult
> {}
