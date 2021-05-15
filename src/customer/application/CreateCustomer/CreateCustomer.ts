import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { ICustomerRepository } from '../../persistence/ICustomerRepository';
import { withTransaction } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Customer } from '../../entity/Customer';
import { CreateCustomerRequest, ICreateCustomer } from './ICreateCustomer';

@Injectable()
export class CreateCustomer implements ICreateCustomer {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    createCustomerRequest: CreateCustomerRequest,
    mongoTransactionSession?: ClientSession,
  ): Promise<Customer> {
    const customer: Customer = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.createCustomer(createCustomerRequest, sessionWithTransaction),
      this.mongoClient,
      mongoTransactionSession,
    );

    return customer;
  }

  private async createCustomer(
    { email }: CreateCustomerRequest,
    mongoTransactionSession: ClientSession,
  ): Promise<Customer> {
    const customer: Customer = {
      id: UUID(),
      email,
      orderIds: [],
    };

    await this.customerRepository.addCustomer(
      customer,
      mongoTransactionSession,
    );

    return customer;
  }
}
