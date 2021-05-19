import { Injectable } from '@nestjs/common';
import { ClientSession, MongoClient } from 'mongodb';
import { InjectClient } from 'nest-mongodb';
import Stripe from 'stripe';
import { inspect } from 'util';
import { withTransaction } from '../../../../../common/application';
import {
  IUpdateHostAccount,
  UpdateHostAccountRequest,
} from './IUpdateHostAccountHandler';

@Injectable()
export class UpdateHostAccountHandler implements IUpdateHostAccount {
  constructor(@InjectClient() private readonly mongoClient: MongoClient) {}

  async execute(
    updateHostAccountRequest: UpdateHostAccountRequest,
    mongoTransactionSession?: ClientSession,
  ) {
    await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.updateHostAccount(
          updateHostAccountRequest,
          sessionWithTransaction,
        ),
      this.mongoClient,
      mongoTransactionSession,
    );
  }

  private async updateHostAccount(
    hostAccount: Stripe.Account,
    mongoTransactionSession: ClientSession,
  ) {
    console.log(hostAccount);
  }
}
