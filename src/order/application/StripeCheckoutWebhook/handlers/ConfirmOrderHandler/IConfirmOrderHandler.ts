import { Match } from '../../../ConfirmOrder/ConfirmOrder';
import { UseCase } from '../../../../../common/application';
import { Address } from '../../../../../common/domain';

export type ConfirmOrderWebhookPayload = Match;

export type ConfirmOrderWebhookResult = {
  address: Address;
};

export abstract class IConfirmOrderHandler extends UseCase<
  ConfirmOrderWebhookPayload,
  ConfirmOrderWebhookResult
> {}
