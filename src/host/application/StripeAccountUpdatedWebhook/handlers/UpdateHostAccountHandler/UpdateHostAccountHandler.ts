import { Injectable } from '@nestjs/common';
import { ClientSession } from 'mongodb';
import Stripe from 'stripe';
import {
  Transaction,
  TransactionUseCasePort,
} from '../../../../../common/application';
import { IHostRepository } from '../../../../persistence/IHostRepository';
import {
  IUpdateHostAccount,
  UpdateHostAccountPayload,
} from './IUpdateHostAccountHandler';

@Injectable()
export class UpdateHostAccountHandler implements IUpdateHostAccount {
  constructor(private readonly hostRepository: IHostRepository) {}

  @Transaction
  async execute({
    port: updateHostAccountPayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<UpdateHostAccountPayload>) {
    await this.updateHostAccount(
      updateHostAccountPayload,
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
    details_submitted,
    requirements,
    capabilities,
  }: Stripe.Account): boolean {
    return (
      charges_enabled &&
      payouts_enabled &&
      details_submitted &&
      requirements.currently_due.length === 0 &&
      capabilities.transfers === 'active'
    );
  }
}
