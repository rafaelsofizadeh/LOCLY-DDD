import { UseCase } from '../../../common/application';
import { IsUUID, UUID } from '../../../common/domain';

export interface PayShipmentRequest {
  readonly orderId: UUID;
  readonly customerId: UUID;
}

export class PayShipmentRequest implements PayShipmentRequest {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly customerId: UUID;
}

export interface StripeCheckoutSessionResult {
  checkoutId: string;
}

export abstract class IPayShipment extends UseCase<
  PayShipmentRequest,
  StripeCheckoutSessionResult
> {}
