import { UseCase } from '../../../common/application';

import { IsUUID, UUID } from '../../../common/domain';

export interface ConfirmOrderRequest {
  readonly orderId: UUID;
  readonly customerId: UUID;
}

export class ConfirmOrderRequest {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly customerId: UUID;
}

export interface StripeCheckoutSessionResult {
  checkoutId: string;
}

export abstract class IConfirmOrder extends UseCase<
  ConfirmOrderRequest,
  StripeCheckoutSessionResult
> {}
