import { HttpStatus, Injectable } from '@nestjs/common';
import { ClientSession } from 'mongodb';
import {
  GetHostUpsertPayload,
  GetHostUpsertResult,
  IGetHostUpsert,
} from './IGetHostUpsert';
import { IGetHost } from '../GetHost/IGetHost';
import { ICreateHost } from '../CreateHost/ICreateHost';
import { Host } from '../../entity/Host';
import { throwCustomException } from '../../../common/error-handling';
import {
  Transaction,
  TransactionUseCasePort,
} from '../../../common/application';

@Injectable()
export class GetHostUpsert implements IGetHostUpsert {
  constructor(
    private readonly getHost: IGetHost,
    private readonly createHost: ICreateHost,
  ) {}

  @Transaction
  async execute({
    port: getHostUpsertPayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<GetHostUpsertPayload>): Promise<
    GetHostUpsertResult
  > {
    return this.getHostUpsert(getHostUpsertPayload, mongoTransactionSession);
  }

  async getHostUpsert(
    { country, ...getHostPayload }: GetHostUpsertPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<GetHostUpsertResult> {
    try {
      const host: Host = await this.getHost.execute({
        port: getHostPayload,
        mongoTransactionSession,
      });

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

      const host: Host = await this.createHost.execute({
        port: { country, ...getHostPayload },
        mongoTransactionSession,
      });

      return {
        host,
        upsert: true,
      };
    }
  }
}
