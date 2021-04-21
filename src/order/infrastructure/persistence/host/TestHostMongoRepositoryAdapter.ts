import { ClientSession, Collection } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectCollection } from 'nest-mongodb';

import { Host } from '../../../domain/entity/Host';
import {
  mongoDocumentToHost,
  HostMongoDocument,
  hostToMongoDocument,
} from './HostMongoMapper';
import { Exception } from '../../../../common/error-handling/Exception';
import { Code } from '../../../../common/error-handling/Code';
import { UUID } from '../../../../common/domain/UUID';
import { uuidToMuuid } from '../../../../common/utils';
import { TestHostRepository } from '../../../application/port/host/TestHostRepository';

@Injectable()
export class TestHostMongoRepositoryAdapter implements TestHostRepository {
  constructor(
    @InjectCollection('test_hosts')
    private readonly hostCollection: Collection<HostMongoDocument>,
  ) {}

  async addManyHosts(
    hosts: Host[],
    transaction?: ClientSession,
  ): Promise<void> {
    await this.hostCollection.insertMany(hosts.map(hostToMongoDocument), {
      session: transaction,
    });
  }

  async addHost(host: Host, transaction?: ClientSession): Promise<void> {
    await this.hostCollection.insertOne(hostToMongoDocument(host), {
      session: transaction,
    });
  }

  async deleteManyHosts(
    hostIds: UUID[],
    transaction?: ClientSession,
  ): Promise<void> {
    await this.hostCollection.deleteMany(
      {
        _id: {
          $in: hostIds.map(hostId => uuidToMuuid(hostId)),
        },
      },
      transaction ? { session: transaction } : undefined,
    );
  }

  async deleteHost(hostId: UUID, transaction?: ClientSession): Promise<void> {
    await this.hostCollection.deleteOne(
      {
        _id: uuidToMuuid(hostId),
      },
      transaction ? { session: transaction } : undefined,
    );
  }

  async findHost(hostId: UUID, transaction?: ClientSession): Promise<Host> {
    const hostDocument: HostMongoDocument = await this.hostCollection.findOne(
      {
        _id: uuidToMuuid(hostId),
      },
      transaction ? { session: transaction } : undefined,
    );

    if (!hostDocument) {
      throw new Exception(
        Code.ENTITY_NOT_FOUND_ERROR,
        `Order (id: ${hostId}) not found`,
        { hostId },
      );
    }

    return mongoDocumentToHost(hostDocument);
  }
}
