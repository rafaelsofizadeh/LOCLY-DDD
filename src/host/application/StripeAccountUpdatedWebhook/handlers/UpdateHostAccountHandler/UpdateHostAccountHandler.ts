import { Injectable } from '@nestjs/common';
import { ClientSession, MongoClient } from 'mongodb';
import { InjectClient } from 'nest-mongodb';
import Stripe from 'stripe';
import { withTransaction } from '../../../../../common/application';
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
    const isHostCurrentlyVerified =
      hostStripeAccount.charges_enabled &&
      hostStripeAccount.payouts_enabled &&
      hostStripeAccount.requirements.currently_due.length === 0 &&
      // TODO(NOW): Should I check capabilities?
      hostStripeAccount.capabilities.card_payments === 'active' &&
      hostStripeAccount.capabilities.transfers === 'active';

    await this.hostRepository.setProperties(
      { stripeAccountId: hostStripeAccount.id },
      { verified: isHostCurrentlyVerified },
      mongoTransactionSession,
    );
  }
}
