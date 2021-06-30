import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { ICustomerRepository } from '../../persistence/ICustomerRepository';
import { withTransaction } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Customer } from '../../entity/Customer';
import { CreateCustomerPayload, ICreateCustomer } from './ICreateCustomer';
import Stripe from 'stripe';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';

@Injectable()
export class CreateCustomer implements ICreateCustomer {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
    @InjectStripeClient() private readonly stripe: Stripe,
  ) {}

  async execute(
    createCustomerPayload: CreateCustomerPayload,
    mongoTransactionSession?: ClientSession,
  ): Promise<Customer> {
    const customer: Customer = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.createCustomer(createCustomerPayload, sessionWithTransaction),
      this.mongoClient,
      mongoTransactionSession,
    );

    return customer;
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
