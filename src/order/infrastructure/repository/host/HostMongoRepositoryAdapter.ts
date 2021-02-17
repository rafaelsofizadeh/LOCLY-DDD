import { Collection } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectCollection } from 'nest-mongodb';
import * as MUUID from 'uuid-mongodb';

import { HostRepository } from '../../../application/port/HostRepository';
import { Host } from '../../../domain/entity/Host';
import {
  mongoDocumentToHost,
  HostMongoDocument,
  hostToMongoDocument,
} from './HostMongoMapper';
import { Exception } from '../../../../common/error-handling/Exception';
import { Code } from '../../../../common/error-handling/Code';
import { Order } from '../../../domain/entity/Order';
import { EntityId } from '../../../../common/domain/EntityId';

@Injectable()
export class HostMongoRepositoryAdapter implements HostRepository {
  constructor(
    @InjectCollection('hosts')
    private readonly hostCollection: Collection<HostMongoDocument>,
  ) {}

  // For testing
  async addManyHosts(hosts: Host[]): Promise<void> {
    this.hostCollection.insertMany(hosts.map(hostToMongoDocument));
  }

  async addHost(host: Host): Promise<void> {
    this.hostCollection.insertOne(hostToMongoDocument(host));
  }

  // For testing
  async deleteManyHosts(hostIds: EntityId[]): Promise<void> {
    this.hostCollection.deleteMany({
      _id: {
        $in: hostIds.map(({ value }) => MUUID.from(value)),
      },
    });
  }

  async deleteHost(hostId: EntityId): Promise<void> {
    this.hostCollection.deleteOne({
      _id: MUUID.from(hostId.value),
    });
  }

  async addOrderToHost(
    { orderIds, ...restHost }: Host,
    newOrder: Order,
  ): Promise<void> {
    this.hostCollection.updateOne(
      { _id: MUUID.from(restHost.id.value) },
      {
        $push: {
          orderIds: MUUID.from(newOrder.id.value),
        },
      },
    );
  }

  async findHost(hostId: EntityId): Promise<Host> {
    const hostDocument: HostMongoDocument = await this.hostCollection.findOne({
      _id: MUUID.from(hostId.value),
    });

    if (!hostDocument) {
      throw new Exception(
        Code.ENTITY_NOT_FOUND_ERROR,
        `Order (id: ${hostId.value}) not found`,
        { hostId },
      );
    }

    return mongoDocumentToHost(hostDocument);
  }

  async findHostAvailableInCountryWithMinimumNumberOfOrders(
    country: string,
  ): Promise<Host> {
    // Finding max value in array: https://stackoverflow.com/questions/32076382/mongodb-how-to-get-max-value-from-collections
    // Sorting by array length: https://stackoverflow.com/a/54529224/6539857
    // Destructuring because the result is limited to 1 (TODO: ARRAY DESTR. DOESN'T WORK)
    // $sort + $limit coalescense: https://docs.mongodb.com/manual/reference/method/cursor.sort/#limit-results
    const hostDocuments: HostMongoDocument[] = await this.hostCollection
      .aggregate([
        { $match: this.hostAvailableInCountryQuery(country) },
        {
          $addFields: {
            orderCount: {
              $size: '$orderIds',
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

    const hostDocument = hostDocuments[0];

    if (!hostDocument) {
      throw new Exception(
        Code.ENTITY_NOT_FOUND_ERROR,
        `No available host (country: ${country})`,
        { country },
      );
    }

    return mongoDocumentToHost(hostDocument);
  }

  private hostAvailableInCountryQuery(country: string) {
    return {
      'address.country': country,
      available: true,
    };
  }
}
