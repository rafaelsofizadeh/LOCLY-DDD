import { Match } from '../../../ConfirmOrder/ConfirmOrder';
import { UseCase } from '../../../../../common/application';
import { Address } from '../../../../../common/domain';
import { Customer } from '../../../../../customer/entity/Customer';

export type ConfirmOrderWebhookPayload = Match &
  Partial<{
    customerId: Customer['id'];
    balanceDiscountUsdCents: number;
    refereeCustomerId: Customer['id'];
  }>;

export type ConfirmOrderWebhookResult = {
  address: Address;
};

export abstract class IConfirmOrderHandler extends UseCase<
  ConfirmOrderWebhookPayload,
  ConfirmOrderWebhookResult
> {}
