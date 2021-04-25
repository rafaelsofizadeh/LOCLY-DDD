import { ClientSession, Collection } from 'mongodb';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectCollection } from 'nest-mongodb';

import { HostRepository } from '../../../application/port/HostRepository';
import { Host } from '../../../domain/entity/Host';
import {
  mongoDocumentToHost,
  HostMongoDocument,
  hostToMongoDocument,
} from './HostMongoMapper';
import { Exception } from '../../../../common/error-handling';
import { UUID } from '../../../../common/domain';
import { Country } from '../../../domain/data/Country';
import { uuidToMuuid } from '../../../../common/persistence';

@Injectable()
export class HostMongoRepositoryAdapter implements HostRepository {
  constructor(
    @InjectCollection('hosts')
    private readonly hostCollection: Collection<HostMongoDocument>,
  ) {}

  // For testing
  async addManyHosts(hosts: Host[], session?: ClientSession): Promise<void> {
    await this.hostCollection.insertMany(hosts.map(hostToMongoDocument), {
      session,
    });
  }

  async addHost(host: Host, session?: ClientSession): Promise<void> {
    await this.hostCollection.insertOne(hostToMongoDocument(host), {
      session,
    });
  }

  // For testing
  async deleteManyHosts(
    hostIds: UUID[],
    session?: ClientSession,
  ): Promise<void> {
    await this.hostCollection.deleteMany(
      {
        _id: { $in: hostIds.map(hostId => uuidToMuuid(hostId)) },
      },
      { session },
    );
  }

  async deleteHost(hostId: UUID, session?: ClientSession): Promise<void> {
    await this.hostCollection.deleteOne(
      { _id: uuidToMuuid(hostId) },
      { session },
    );
  }

  // This should always be used together with OrderRepository.addHostToOrder
  async addOrderToHost(
    hostId: UUID,
    orderId: UUID,
    session?: ClientSession,
  ): Promise<void> {
    await this.hostCollection
      .updateOne(
        { _id: uuidToMuuid(hostId) },
        { $push: { orderIds: uuidToMuuid(orderId) } },
        { session },
      )
      .catch(error => {
        throw new Exception(
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Host couldn't accept order and add order to host (orderId: ${orderId}, hostId: ${hostId}): ${error}`,
          { hostId, orderId },
        );
      });
  }

  async findHost(hostId: UUID, session?: ClientSession): Promise<Host> {
    const hostDocument: HostMongoDocument = await this.hostCollection.findOne(
      { _id: uuidToMuuid(hostId) },
      { session },
    );

    if (!hostDocument) {
      throw new Exception(
        HttpStatus.NOT_FOUND,
        `Order (id: ${hostId}) not found`,
        { hostId },
      );
    }

    return mongoDocumentToHost(hostDocument);
  }

  async findHostAvailableInCountryWithMinimumNumberOfOrders(
    country: Country,
    session?: ClientSession,
  ): Promise<Host> {
    // Finding max value in array: https://stackoverflow.com/questions/32076382/mongodb-how-to-get-max-value-from-collections
    // Sorting by array length: https://stackoverflow.com/a/54529224/6539857
    // Destructuring because the result is limited to 1 (TODO: ARRAY DESTR. DOESN'T WORK)
    // $sort + $limit coalescense: https://docs.mongodb.com/manual/reference/method/cursor.sort/#limit-results
    const hostDocuments: HostMongoDocument[] = await this.hostCollection
      .aggregate(
        [
          {
            $match: {
              'address.country': country,
              available: true,
            },
          },
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
        { session },
      )
      .toArray();

    if (!hostDocuments.length) {
      throw new Exception(
        HttpStatus.NOT_FOUND,
        `No available host (country: ${country})`,
        { country },
      );
    }

    const hostDocument = hostDocuments[0];
    return mongoDocumentToHost(hostDocument);
  }
}
