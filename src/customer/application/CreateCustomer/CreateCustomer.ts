import Stripe from 'stripe';
import { ClientSession } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';

import appConfig from '../../../../app.configuration';

import { ICustomerRepository } from '../../persistence/ICustomerRepository';
import {
  Transaction,
  TransactionUseCasePort,
} from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Customer } from '../../entity/Customer';
import { CreateCustomerPayload, ICreateCustomer } from './ICreateCustomer';

@Injectable()
export class CreateCustomer extends ICreateCustomer {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    @InjectStripeClient() private readonly stripe: Stripe,
  ) {
    super();
  }

  @Transaction
  async execute({
    port: createCustomerPayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<CreateCustomerPayload>): Promise<Customer> {
    return this.createCustomer(createCustomerPayload, mongoTransactionSession);
  }

  private async createCustomer(
    { email }: CreateCustomerPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<Customer> {
    const {
      id: stripeCustomerId,
    }: Stripe.Customer = await this.stripe.customers.create({
      email,
    });

    const customer: Customer = {
      id: UUID(),
      email,
      stripeCustomerId,
      balanceUsdCents: 0,
      referralCode: this.referralCode(),
      orderIds: [],
      addresses: [],
    };

    await this.customerRepository.addCustomer(
      customer,
      mongoTransactionSession,
    );

    return customer;
  }

  private referralCode(): string {
    const length = Number(appConfig.rewards.codeLength);

    return Math.random()
      .toString(36)
      .slice(2, 2 + length);
  }
}
