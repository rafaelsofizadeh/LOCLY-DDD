import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { IHostRepository } from '../../../host/persistence/IHostRepository';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/application';
import {
  GetHostDashboardLinksPayload,
  HostDashboardLinks,
  IGetHostDashboardLinks,
  StripeAccountLink,
} from './IGetHostDashboardLinks';
import { Host } from '../../entity/Host';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';

@Injectable()
export class GetHostDashboardLinks implements IGetHostDashboardLinks {
  constructor(
    private readonly hostRepository: IHostRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
    @InjectStripeClient() private readonly stripe: Stripe,
  ) {}

  async execute(
    payload: GetHostDashboardLinksPayload,
    mongoTransactionSession?: ClientSession,
  ): Promise<HostDashboardLinks> {
    const hostDashboardLinks: HostDashboardLinks = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.generateHostStripeAccountLinks(payload, sessionWithTransaction),
      this.mongoClient,
      mongoTransactionSession,
    );

    return hostDashboardLinks;
  }

  private async generateHostStripeAccountLinks(
    { hostId }: GetHostDashboardLinksPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<HostDashboardLinks> {
    const { stripeAccountId }: Host = await this.hostRepository.findHost(
      {
        hostId,
      },
      mongoTransactionSession,
    );

    const [onboardingLink, editProfileLink]: StripeAccountLink[] = (
      await Promise.all([
        this.stripe.accountLinks.create({
          account: stripeAccountId,
          // TODO
          refresh_url: 'https://example.com',
          // TODO
          return_url: 'https://example.com',
          type: 'account_onboarding',
        }),
        this.stripe.accountLinks.create({
          account: stripeAccountId,
          // TODO
          refresh_url: 'https://example.com',
          // TODO
          return_url: 'https://example.com',
          type: 'account_update',
        }),
      ])
    ).map(({ expires_at, url }) => ({
      url,
      // expires_at is Unix Epoch, which is in seconds; Date accepts milliseconds
      expiresAt: new Date(expires_at * 1000),
    }));

    return { onboardingLink, editProfileLink };
  }
}
