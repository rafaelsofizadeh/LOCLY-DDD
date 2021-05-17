import { UseCase } from '../../../common/application';
import { IsUUID, UUID } from '../../../common/domain';
import { UnidCustomerOrderRequest } from '../../entity/Order';

export interface PayShipmentPayload {
  readonly orderId: UUID;
  readonly customerId: UUID;
}

export class PayShipmentRequest
  implements UnidCustomerOrderRequest<PayShipmentPayload> {
  @IsUUID()
  readonly orderId: UUID;
}

// TODO: extract StripeCheckoutSessionResult to common types
export interface StripeCheckoutSessionResult {
  readonly checkoutId: string;
}

export abstract class IPayShipment extends UseCase<
  PayShipmentPayload,
  StripeCheckoutSessionResult
> {}
