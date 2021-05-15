import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/application';
import {
  GetCustomerUpsertRequest,
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
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    getCustomerUpsertRequest: GetCustomerUpsertRequest,
    mongoTransactionSession?: ClientSession,
  ): Promise<GetCustomerUpsertResult> {
    return withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.getCustomerUpsert(
          getCustomerUpsertRequest,
          sessionWithTransaction,
        ),
      this.mongoClient,
      mongoTransactionSession,
    );
  }

  async getCustomerUpsert(
    getCustomerUpsertRequest: GetCustomerUpsertRequest,
    mongoTransactionSession: ClientSession,
  ): Promise<GetCustomerUpsertResult> {
    try {
      return {
        customer: await this.getCustomer.execute(
          getCustomerUpsertRequest,
          mongoTransactionSession,
        ),
        upsert: false,
      };
    } catch (exception) {
      return {
        customer: await this.createCustomer.execute(
          getCustomerUpsertRequest,
          mongoTransactionSession,
        ),
        upsert: true,
      };
    }
  }
}
