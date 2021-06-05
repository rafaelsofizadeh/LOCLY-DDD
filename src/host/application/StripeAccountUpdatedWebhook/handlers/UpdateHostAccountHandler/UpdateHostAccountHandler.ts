import { Injectable } from '@nestjs/common';
import { ClientSession, MongoClient } from 'mongodb';
import { InjectClient } from 'nest-mongodb';
import Stripe from 'stripe';
import { withTransaction } from '../../../../../common/application';
import { Host } from '../../../../entity/Host';
import { IHostRepository } from '../../../../persistence/IHostRepository';
import {
  IUpdateHostAccount,
  UpdateHostAccountPayload,
} from './IUpdateHostAccountHandler';

@Injectable()
export class UpdateHostAccountHandler implements IUpdateHostAccount {
  constructor(
    private readonly hostRepository: IHostRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    updateHostAccountPayload: UpdateHostAccountPayload,
    mongoTransactionSession?: ClientSession,
  ) {
    await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.updateHostAccount(
          updateHostAccountPayload,
          sessionWithTransaction,
        ),
      this.mongoClient,
      mongoTransactionSession,
    );
  }

  private async updateHostAccount(
    hostStripeAccount: Stripe.Account,
    mongoTransactionSession: ClientSession,
  ) {
    const verified: boolean = this.isHostVerified(hostStripeAccount);

    await this.hostRepository.setProperties(
      { stripeAccountId: hostStripeAccount.id },
      {
        verified,
        // If host becomes not verified, automatically set availability to false
        ...(!verified ? { available: false } : {}),
      },
      mongoTransactionSession,
    );
  }

  private isHostVerified({
    charges_enabled,
    payouts_enabled,
    requirements,
    capabilities,
  }: Stripe.Account): boolean {
    return (
      charges_enabled &&
      payouts_enabled &&
      requirements.currently_due.length === 0 &&
      // TODO(NOW): Should I check capabilities?
      capabilities.card_payments === 'active' &&
      capabilities.transfers === 'active'
    );
  }
}
