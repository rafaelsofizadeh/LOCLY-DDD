import { HttpStatus, Injectable } from '@nestjs/common';
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
import { Host } from '../../entity/Host';
import { throwCustomException } from '../../../common/error-handling';

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
    { country, ...getHostPayload }: GetHostUpsertPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<GetHostUpsertResult> {
    try {
      const host: Host = await this.getHost.execute(
        getHostPayload,
        mongoTransactionSession,
      );

      return {
        host,
        upsert: false,
      };
    } catch (exception) {
      if (country === undefined) {
        throwCustomException(
          "Can't create a host without a country specified",
          {},
          HttpStatus.BAD_REQUEST,
        )();
      }

      const host: Host = await this.createHost.execute(
        { country, ...getHostPayload },
        mongoTransactionSession,
      );

      return {
        host,
        upsert: true,
      };
    }
  }
}
