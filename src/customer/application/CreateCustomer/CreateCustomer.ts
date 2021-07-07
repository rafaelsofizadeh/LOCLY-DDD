import { Injectable } from '@nestjs/common';
import { ClientSession } from 'mongodb';
import { ICustomerRepository } from '../../persistence/ICustomerRepository';
import { Transaction, TransactionUseCasePort } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Customer } from '../../entity/Customer';
import { CreateCustomerPayload, ICreateCustomer } from './ICreateCustomer';
import Stripe from 'stripe';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';

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
      orderIds: [],
      addresses: [],
    };

    await this.customerRepository.addCustomer(
      customer,
      mongoTransactionSession,
    );

    return customer;
  }
}
