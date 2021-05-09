import { Match } from '../../../ConfirmOrder/ConfirmOrderService';
import { Address } from '../../../../entity/Order';
import { UseCase } from '../../../../../common/application';

export interface ConfirmOrderRequest extends Match {}

export interface ConfirmOrderResult {
  address: Address;
}

export abstract class ConfirmOrderWebhookGateway extends UseCase<
  ConfirmOrderRequest,
  ConfirmOrderResult
> {}
