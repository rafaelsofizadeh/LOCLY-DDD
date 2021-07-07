import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { Transaction, TransactionUseCasePort } from '../../../common/application';
import {
  GetCustomerUpsertPayload,
  GetCustomerUpsertResult,
  IGetCustomerUpsert,
} from './IGetCustomerUpsert';
import { IGetCustomer } from '../GetCustomer/IGetCustomer';
import { ICreateCustomer } from '../CreateCustomer/ICreateCustomer';

@Injectable()
export class GetCustomerUpsert implements IGetCustomerUpsert {
  constructor(
    private readonly getCustomer: IGetCustomer,
    private readonly createCustomer: ICreateCustomer,
  ) {}

  @Transaction
  async execute({
    port: getCustomerUpsertPayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<GetCustomerUpsertPayload>): Promise<
    GetCustomerUpsertResult
  > {
    return this.getCustomerUpsert(
      getCustomerUpsertPayload,
      mongoTransactionSession,
    );
  }

  async getCustomerUpsert(
    getCustomerUpsertPayload: GetCustomerUpsertPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<GetCustomerUpsertResult> {
    try {
      return {
        customer: await this.getCustomer.execute({
          port: getCustomerUpsertPayload,
          mongoTransactionSession,
        }),
        upsert: false,
      };
    } catch (exception) {
      return {
        customer: await this.createCustomer.execute({
          port: getCustomerUpsertPayload,
          mongoTransactionSession,
        }),
        upsert: true,
      };
    }
  }
}
