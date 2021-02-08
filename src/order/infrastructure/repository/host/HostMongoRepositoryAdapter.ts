import { Collection } from 'mongodb';
import * as MUUID from 'uuid-mongodb';
import { Injectable } from '@nestjs/common';
import { InjectCollection } from 'nest-mongodb';

import { EntityId } from '../../../../common/domain/EntityId';
import { HostRepository } from '../../../application/port/HostRepository';
import { Host } from '../../../domain/entity/Host';
import { mongoDocumentToHost, HostMongoDocument } from './HostMongoMapper';
import { Exception } from '../../../../common/error-handling/Exception';
import { Code } from '../../../../common/error-handling/Code';

@Injectable()
export class HostMongoRepositoryAdapter implements HostRepository {
  constructor(
    @InjectCollection('hosts')
    private readonly hostCollection: Collection<HostMongoDocument>,
  ) {}

  async findAvailableHostInCountry(country: string): Promise<Host> {
    const hostDocument: HostMongoDocument = await this.hostCollection.findOne({
      'address.country': country,
      available: true,
    });

    if (!hostDocument) {
      throw new Exception(
        Code.ENTITY_NOT_FOUND_ERROR,
        `No available host (country: ${country}) not found`,
        { country },
      );
    }

    return mongoDocumentToHost(hostDocument);
  }
}
