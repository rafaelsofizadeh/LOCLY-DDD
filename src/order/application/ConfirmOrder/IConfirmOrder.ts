import {
  StripeCheckoutSessionResult,
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
  abstract calculateTotalFee(): Cost;

  abstract calculateLoclyFee({ currency, amount: totalAmount }: Cost): Cost;
}
