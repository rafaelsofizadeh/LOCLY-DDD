import { ICustomerRepository } from '../../persistence/ICustomerRepository';

import { Injectable } from '@nestjs/common';
import { ClientSession } from 'mongodb';
import { Transaction, TransactionUseCasePort } from '../../../common/application';
import { GetCustomerPayload, IGetCustomer } from './IGetCustomer';
import { Customer } from '../../entity/Customer';

@Injectable()
export class GetCustomer implements IGetCustomer {
  constructor(private readonly customerRepository: ICustomerRepository) {}

  @Transaction
  async execute({
    port: getCustomerPayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<GetCustomerPayload>): Promise<Customer> {
    return this.customerRepository.findCustomer(
      getCustomerPayload,
      mongoTransactionSession,
    );
  }
}
