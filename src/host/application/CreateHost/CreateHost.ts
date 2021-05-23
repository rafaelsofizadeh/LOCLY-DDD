import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { IHostRepository } from '../../../host/persistence/IHostRepository';
import { withTransaction } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Host } from '../../entity/Host';
import { CreateHostPayload, ICreateHost } from './ICreateHost';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import Stripe from 'stripe';

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
    { email }: CreateHostPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<Host> {
    const hostAccount: Stripe.Account = await this.stripe.accounts.create({
      type: 'express',
      email,
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
      stripeAccountId: hostAccount.id,
      available: false,
      verified: false,
    };

    await this.hostRepository.addHost(host, mongoTransactionSession);

    return host;
  }
}
