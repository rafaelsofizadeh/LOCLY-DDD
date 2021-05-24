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
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      settings: {
        payouts: {
          schedule: {
            delay_days: 10,
          },
        },
      },
    });

    const host: Host = {
      id: UUID(),
      email,
      country,
      stripeAccountId: hostAccount.id,
      available: false,
      verified: false,
      profileComplete: false,
    };

    await this.hostRepository.addHost(host, mongoTransactionSession);

    return host;
  }
}
