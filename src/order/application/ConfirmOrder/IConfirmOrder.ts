import {
  StripeCheckoutSessionResult,
  UseCase,
} from '../../../common/application';

import { IsUUID, UUID } from '../../../common/domain';
import { UnidCustomerOrderRequest } from '../../entity/Order';

export interface ConfirmOrderPayload {
  readonly orderId: UUID;
  readonly customerId: UUID;
}

export class ConfirmOrderRequest
  implements UnidCustomerOrderRequest<ConfirmOrderPayload> {
  @IsUUID()
  readonly orderId: UUID;
}

export type ConfirmOrderResult = StripeCheckoutSessionResult;

export abstract class IConfirmOrder extends UseCase<
  ConfirmOrderPayload,
  ConfirmOrderResult
> {}
