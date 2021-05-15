import { ICustomerRepository } from '../../persistence/ICustomerRepository';

import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/application';
import { GetCustomerRequest, IGetCustomer } from './IGetCustomer';
import { Customer } from '../../entity/Customer';

@Injectable()
export class GetCustomer implements IGetCustomer {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    getCustomerRequest: GetCustomerRequest,
    mongoTransactionSession?: ClientSession,
  ): Promise<Customer> {
    const customer: Customer = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.customerRepository.findCustomer(
          getCustomerRequest,
          sessionWithTransaction,
        ),
      this.mongoClient,
      mongoTransactionSession,
    );

    return customer;
  }
}
