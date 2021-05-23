import { Injectable } from '@nestjs/common';
import { ClientSession, MongoClient } from 'mongodb';
import { InjectClient } from 'nest-mongodb';
import { withTransaction } from '../../../common/application';
import { ICustomerRepository } from '../../persistence/ICustomerRepository';
import { EditCustomerPayload, IEditCustomer } from './IEditCustomer';

@Injectable()
export class AddAddress implements IEditCustomer {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    editCustomerPayload: EditCustomerPayload,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.editCustomer(editCustomerPayload, sessionWithTransaction),
      this.mongoClient,
      mongoTransactionSession,
    );
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
