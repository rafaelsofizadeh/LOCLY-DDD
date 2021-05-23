import { Match } from '../../../ConfirmOrder/ConfirmOrder';
import { Address } from '../../../../entity/Order';
import { UseCase } from '../../../../../common/application';

export type ConfirmOrderWebhookPayload = Match;

export type ConfirmOrderWebhookResult = {
  address: Address;
};

export abstract class IConfirmOrderHandler extends UseCase<
  ConfirmOrderWebhookPayload,
  ConfirmOrderWebhookResult
> {}
