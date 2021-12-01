import Stripe from 'stripe';
import {
  StripeCheckoutSessionResult,
  StripePrice,
  UseCase,
} from '../../../common/application';

import { IsUUID, UUID } from '../../../common/domain';
import { UnidCustomerRequest } from '../../../customer/entity/Customer';
import { Cost } from '../../entity/Order';

export interface ConfirmOrderPayload {
  readonly orderId: UUID;
  readonly customerId: UUID;
}

export class ConfirmOrderRequest
  implements UnidCustomerRequest<ConfirmOrderPayload> {
  @IsUUID()
  readonly orderId: UUID;
}

export type ConfirmOrderResult = StripeCheckoutSessionResult;

export abstract class IConfirmOrder extends UseCase<
  ConfirmOrderPayload,
  ConfirmOrderResult
> {
  abstract calculateLoclyCut(
    totalPriceId: Stripe.Price['id'],
  ): Promise<{ total: StripePrice; loclyFee: StripePrice }>;
}
