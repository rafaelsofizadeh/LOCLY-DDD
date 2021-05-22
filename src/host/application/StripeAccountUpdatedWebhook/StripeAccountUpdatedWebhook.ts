import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import { StripeWebhookHandler } from '@golevelup/nestjs-stripe';

import { StripeEvent } from '../../../common/application';
import { IUpdateHostAccount } from './handlers/UpdateHostAccountHandler/IUpdateHostAccountHandler';
import {
  IStripeAccountUpdatedWebhook,
  StripeAccountUpdatedResult,
} from './IStripeAccountUpdatedWebhook';

@Injectable()
export class StripeAccountUpdatedWebhook
  implements IStripeAccountUpdatedWebhook {
  constructor(
    private readonly updateHostAccountWebhookGateway: IUpdateHostAccount,
  ) {}

  @StripeWebhookHandler('account.updated')
  execute(event: StripeEvent): Promise<StripeAccountUpdatedResult> {
    // TODO: event.data.object extracting decorator
    const webhookPayload = event.data.object as Stripe.Account;

    return this.updateHostAccountWebhookGateway.execute(webhookPayload);
  }
}
