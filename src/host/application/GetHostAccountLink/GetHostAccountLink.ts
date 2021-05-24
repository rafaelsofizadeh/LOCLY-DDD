import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import {
  GetHostAccountLinkPayload,
  HostAccountLink,
  IGetHostAccountLink,
} from './IGetHostAccountLink';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';

@Injectable()
export class GetHostAccountLink implements IGetHostAccountLink {
  constructor(@InjectStripeClient() private readonly stripe: Stripe) {}

  async execute(payload: GetHostAccountLinkPayload): Promise<HostAccountLink> {
    return this.generateHostStripeAccountLink(payload);
  }

  private async generateHostStripeAccountLink({
    stripeAccountId,
  }: GetHostAccountLinkPayload): Promise<HostAccountLink> {
    const {
      details_submitted: detailsSubmitted,
    }: Stripe.Account = await this.stripe.accounts.retrieve(stripeAccountId);

    //  Hasn't previously onboarded
    if (detailsSubmitted) {
      const { url } = await this.stripe.accounts.createLoginLink(
        stripeAccountId,
      );

      return { url };
    }

    // Has previosly onboarded
    const { expires_at, url } = await this.stripe.accountLinks.create({
      account: stripeAccountId,
      // TODO
      refresh_url: 'https://example.com',
      // TODO
      return_url: 'https://example.com',
      type: 'account_onboarding',
    });

    return {
      url,
      // expires_at is Unix Epoch, which is in seconds; Date accepts milliseconds
      expiresAt: new Date(expires_at * 1000),
    };
  }
}
