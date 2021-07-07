import { IHostRepository } from '../../../host/persistence/IHostRepository';

import { Injectable } from '@nestjs/common';
import { ClientSession } from 'mongodb';
import { GetHostPayload, IGetHost } from './IGetHost';
import { Host } from '../../entity/Host';
import { Transaction, TransactionUseCasePort } from '../../../common/application';

@Injectable()
export class GetHost implements IGetHost {
  constructor(private readonly hostRepository: IHostRepository) {}

  @Transaction
  async execute({
    port: getHostPayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<GetHostPayload>): Promise<Host> {
    return this.hostRepository.findHost(
      getHostPayload,
      mongoTransactionSession,
    );
  }
}
