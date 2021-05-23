import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { withTransaction } from '../../../common/application';
import {
  GetHostUpsertPayload,
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
    getHostUpsertPayload: GetHostUpsertPayload,
    mongoTransactionSession?: ClientSession,
  ): Promise<GetHostUpsertResult> {
    return withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.getHostUpsert(getHostUpsertPayload, sessionWithTransaction),
      this.mongoClient,
      mongoTransactionSession,
    );
  }

  async getHostUpsert(
    getHostUpsertPayload: GetHostUpsertPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<GetHostUpsertResult> {
    try {
      return {
        host: await this.getHost.execute(
          getHostUpsertPayload,
          mongoTransactionSession,
        ),
        upsert: false,
      };
    } catch (exception) {
      return {
        host: await this.createHost.execute(
          getHostUpsertPayload,
          mongoTransactionSession,
        ),
        upsert: true,
      };
    }
  }
}
