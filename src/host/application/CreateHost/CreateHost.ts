import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { alpha3ToAlpha2 } from 'i18n-iso-countries';
import { IHostRepository } from '../../../host/persistence/IHostRepository';
import { withTransaction } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Host } from '../../entity/Host';
import { CreateHostPayload, ICreateHost } from './ICreateHost';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';

@Injectable()
export class CreateHost implements ICreateHost {
  constructor(
    private readonly hostRepository: IHostRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
    @InjectStripeClient() private readonly stripe: Stripe,
  ) {}

  async execute(
    createHostPayload: CreateHostPayload,
    mongoTransactionSession?: ClientSession,
  ): Promise<Host> {
    const host: Host = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.createHost(createHostPayload, sessionWithTransaction),
      this.mongoClient,
      mongoTransactionSession,
    );

    return host;
  }

  private async createHost(
    { email, country }: CreateHostPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<Host> {
    // TODO(VERY IMPORTANT): Check if country is supported by Stripe
    const hostAccount: Stripe.Account = await this.stripe.accounts.create({
      type: 'express',
      email,
      country: alpha3ToAlpha2(country),
      capabilities: {
        // TODO(IMPORTANT): Recipient service agreement doesn't allow for 'card_payments'. Manual payouts.
        // [Removed payout settings].
        transfers: { requested: true },
      },
      business_type: 'individual',
      // TODO: Do this through Stripe dashboard
      // https://stripe.com/docs/connect/service-agreement-types#choosing-type-with-express
      // https://dashboard.stripe.com/settings/connect/express
      tos_acceptance: {
        service_agreement: 'recipient',
      },
    });

    const host: Host = {
      id: UUID(),
      email,
      country,
      orderIds: [],
      stripeAccountId: hostAccount.id,
      available: false,
      verified: false,
      profileComplete: false,
    };

    await this.hostRepository.addHost(host, mongoTransactionSession);

    return host;
  }
}
