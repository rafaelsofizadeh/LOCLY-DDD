import { IsInt, IsNumber, IsPositive, Min } from 'class-validator';
import {
  StripeCheckoutSessionResult,
  UseCase,
} from '../../../common/application';

import { IsUUID, UUID } from '../../../common/domain';
import { UnidCustomerRequest } from '../../../customer/entity/Customer';

export type ConfirmOrderPayload = Readonly<{
  orderId: UUID;
  customerId: UUID;
  balanceDiscountUsdCents: number;
}>;

export class ConfirmOrderRequest
  implements UnidCustomerRequest<ConfirmOrderPayload> {
  @IsUUID()
  readonly orderId: UUID;

  @IsNumber()
  @IsInt()
  @Min(0)
  readonly balanceDiscountUsdCents: number = 0;
}

export type ConfirmOrderResult = StripeCheckoutSessionResult;

export abstract class IConfirmOrder extends UseCase<
  ConfirmOrderPayload,
  ConfirmOrderResult
> {}
