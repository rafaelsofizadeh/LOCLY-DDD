import {
  StripeCheckoutSessionResult,
  UseCase,
} from '../../../common/application';
import { IsUUID, UUID } from '../../../common/domain';
import { UnidCustomerRequest } from '../../../customer/entity/Customer';

export interface PayShipmentPayload {
  readonly orderId: UUID;
  readonly customerId: UUID;
}

export class PayShipmentRequest
  implements UnidCustomerRequest<PayShipmentPayload> {
  @IsUUID()
  readonly orderId: UUID;
}

export type PayShipmentResult = StripeCheckoutSessionResult;

export abstract class IPayShipment extends UseCase<
  PayShipmentPayload,
  PayShipmentResult
> {}
