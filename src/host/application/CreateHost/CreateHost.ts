import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb';
import { ClientSession, MongoClient } from 'mongodb';
import { IHostRepository } from '../../../host/persistence/IHostRepository';
import { withTransaction } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Host } from '../../entity/Host';
import { CreateHostRequest, ICreateHost } from './ICreateHost';

@Injectable()
export class CreateHost implements ICreateHost {
  constructor(
    private readonly hostRepository: IHostRepository,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    createHostRequest: CreateHostRequest,
    mongoTransactionSession?: ClientSession,
  ): Promise<Host> {
    const host: Host = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.createHost(createHostRequest, sessionWithTransaction),
      this.mongoClient,
      mongoTransactionSession,
    );

    return host;
  }

  private async createHost(
    { email }: CreateHostRequest,
    mongoTransactionSession: ClientSession,
  ): Promise<Host> {
    const host: Host = {
      id: UUID(),
      email,
      available: false,
      verified: false,
    };

    await this.hostRepository.addHost(host, mongoTransactionSession);

    return host;
  }
}
