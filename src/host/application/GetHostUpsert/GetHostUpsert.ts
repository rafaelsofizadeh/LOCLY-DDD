import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/application';
import {
  GetHostUpsertRequest,
  GetHostUpsertResult,
  IGetHostUpsert,
} from './IGetHostUpsert';
import { IGetHost } from '../GetHost/IGetHost';
import { ICreateHost } from '../CreateHost/ICreateHost';

@Injectable()
export class GetHostUpsert implements IGetHostUpsert {
  constructor(
    private readonly getHost: IGetHost,
    private readonly createHost: ICreateHost,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    getHostUpsertRequest: GetHostUpsertRequest,
    mongoTransactionSession?: ClientSession,
  ): Promise<GetHostUpsertResult> {
    return withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.getHostUpsert(getHostUpsertRequest, sessionWithTransaction),
      this.mongoClient,
      mongoTransactionSession,
    );
  }

  async getHostUpsert(
    getHostUpsertRequest: GetHostUpsertRequest,
    mongoTransactionSession: ClientSession,
  ): Promise<GetHostUpsertResult> {
    try {
      return {
        host: await this.getHost.execute(
          getHostUpsertRequest,
          mongoTransactionSession,
        ),
        upsert: false,
      };
    } catch (exception) {
      return {
        host: await this.createHost.execute(
          getHostUpsertRequest,
          mongoTransactionSession,
        ),
        upsert: true,
      };
    }
  }
}
