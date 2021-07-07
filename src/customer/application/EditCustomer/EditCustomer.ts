import { Injectable } from '@nestjs/common';
import { ClientSession } from 'mongodb';
import { Transaction, TransactionUseCasePort } from '../../../common/application';
import { ICustomerRepository } from '../../persistence/ICustomerRepository';
import { EditCustomerPayload, IEditCustomer } from './IEditCustomer';

@Injectable()
export class EditCustomer implements IEditCustomer {
  constructor(private readonly customerRepository: ICustomerRepository) {}

  @Transaction
  async execute({
    port: editCustomerPayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<EditCustomerPayload>): Promise<void> {
    return this.editCustomer(editCustomerPayload, mongoTransactionSession);
  }

  private async editCustomer(
    { customerId, ...editCustomerProps }: EditCustomerPayload,
    sessionWithTransaction: ClientSession,
  ) {
    return this.customerRepository.setProperties(
      { customerId },
      editCustomerProps,
      sessionWithTransaction,
    );
  }
}
