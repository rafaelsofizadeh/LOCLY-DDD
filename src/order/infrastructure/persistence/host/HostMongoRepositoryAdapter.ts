import { ClientSession, Collection } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectCollection } from 'nest-mongodb';

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
import { entityIdToMuuid } from '../../../../common/utils';
import { Country } from '../../../domain/data/Country';

@Injectable()
export class HostMongoRepositoryAdapter implements HostRepository {
  constructor(
    @InjectCollection('hosts')
    private readonly hostCollection: Collection<HostMongoDocument>,
  ) {}

  // For testing
  async addManyHosts(
    hosts: Host[],
    transaction?: ClientSession,
  ): Promise<void> {
    this.hostCollection.insertMany(hosts.map(hostToMongoDocument), {
      session: transaction,
    });
  }

  async addHost(host: Host, transaction?: ClientSession): Promise<void> {
    this.hostCollection.insertOne(hostToMongoDocument(host), {
      session: transaction,
    });
  }

  // For testing
  async deleteManyHosts(
    hostIds: EntityId[],
    transaction?: ClientSession,
  ): Promise<void> {
    this.hostCollection.deleteMany(
      {
        _id: {
          $in: hostIds.map(hostId => entityIdToMuuid(hostId)),
        },
      },
      { session: transaction },
    );
  }

  async deleteHost(
    hostId: EntityId,
    transaction?: ClientSession,
  ): Promise<void> {
    this.hostCollection.deleteOne(
      {
        _id: entityIdToMuuid(hostId),
      },
      { session: transaction },
    );
  }

  // This should always be used together with OrderRepository.addHostToOrder
  async addOrderToHost(
    { id: hostId }: Host,
    { id: orderId }: Order,
    transaction?: ClientSession,
  ): Promise<void> {
    this.hostCollection.updateOne(
      { _id: entityIdToMuuid(hostId) },
      {
        $push: {
          orderIds: entityIdToMuuid(orderId),
        },
      },
      { session: transaction },
    );
  }

  async findHost(hostId: EntityId, transaction?: ClientSession): Promise<Host> {
    const hostDocument: HostMongoDocument = await this.hostCollection.findOne(
      {
        _id: entityIdToMuuid(hostId),
      },
      { session: transaction },
    );

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
    country: Country,
    transaction?: ClientSession,
  ): Promise<Host> {
    // Finding max value in array: https://stackoverflow.com/questions/32076382/mongodb-how-to-get-max-value-from-collections
    // Sorting by array length: https://stackoverflow.com/a/54529224/6539857
    // Destructuring because the result is limited to 1 (TODO: ARRAY DESTR. DOESN'T WORK)
    // $sort + $limit coalescense: https://docs.mongodb.com/manual/reference/method/cursor.sort/#limit-results
    const hostDocuments: HostMongoDocument[] = await this.hostCollection
      .aggregate(
        [
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
        ],
        { session: transaction },
      )
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

  private hostAvailableInCountryQuery(country: Country) {
    return {
      'address.country': country,
      available: true,
    };
  }
}
