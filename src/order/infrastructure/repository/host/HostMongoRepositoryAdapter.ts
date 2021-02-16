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

// TODO: mongoDocumentToXXX to a decorator
@Injectable()
export class HostMongoRepositoryAdapter implements HostRepository {
  constructor(
    @InjectCollection('hosts')
    private readonly hostCollection: Collection<HostMongoDocument>,
  ) {}

  async findHostAvailableInCountryWithMinimumNumberOfOrders(
    country: string,
  ): Promise<Host> {
    // Finding max value in array: https://stackoverflow.com/questions/32076382/mongodb-how-to-get-max-value-from-collections
    // Sorting by array length: https://stackoverflow.com/a/54529224/6539857
    // Destructuring because the result is limited to 1
    // $sort + $limit coalescense: https://docs.mongodb.com/manual/reference/method/cursor.sort/#limit-results
    const [hostDocument]: HostMongoDocument[] = await this.hostCollection
      .aggregate([
        { $match: this.hostAvailableInCountryQuery(country) },
        {
          $addFields: {
            orderCount: {
              $size: '$orders',
            },
          },
        },
        {
          $sort: {
            orderCount: 1,
          },
        },
        { $limit: 1 },
      ])
      .toArray();

    if (!hostDocument) {
      throw new Exception(
        Code.ENTITY_NOT_FOUND_ERROR,
        `No available host (country: ${country})`,
        { country },
      );
    }

    return mongoDocumentToHost(hostDocument);
  }

  private hostAvailableInCountryQuery(country) {
    return {
      'address.country': country,
      available: true,
    };
  }
}
