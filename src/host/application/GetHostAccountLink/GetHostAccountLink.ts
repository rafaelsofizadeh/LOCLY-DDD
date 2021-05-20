import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/application';
import {
  GetHostAccountLinkPayload,
  HostAccountLink,
  IGetHostAccountLink,
  StripeAccountLink,
} from './IGetHostAccountLink';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';

export const HostOnboardingLinkType = 'account_onboarding' as const;
export type HostOnboardingLinkType = 'account_onboarding';

@Injectable()
export class GetHostAccountLink implements IGetHostAccountLink {
  constructor(
    @InjectClient() private readonly mongoClient: MongoClient,
    @InjectStripeClient() private readonly stripe: Stripe,
  ) {}

  async execute(
    payload: GetHostAccountLinkPayload,
    mongoTransactionSession?: ClientSession,
  ): Promise<HostAccountLink> {
    const hostAccountLink: HostAccountLink = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.generateHostStripeAccountLink(payload, sessionWithTransaction),
      this.mongoClient,
      mongoTransactionSession,
    );

    return hostAccountLink;
  }

  private async generateHostStripeAccountLink(
    { stripeAccountId }: GetHostAccountLinkPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<HostAccountLink> {
    const onboardingLink: StripeAccountLink = (({ expires_at, url }) => ({
      url,
      // expires_at is Unix Epoch, which is in seconds; Date accepts milliseconds
      expiresAt: new Date(expires_at * 1000),
    }))(
      await this.stripe.accountLinks.create({
        account: stripeAccountId,
        // TODO
        refresh_url: 'https://example.com',
        // TODO
        return_url: 'https://example.com',
        type: HostOnboardingLinkType,
      }),
    );

    return onboardingLink;
  }
}
