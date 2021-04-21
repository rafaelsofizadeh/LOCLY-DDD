import { ClientSession, Collection } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectCollection } from 'nest-mongodb';

import { HostRepository } from '../../../application/port/host/HostRepository';
import { Host } from '../../../domain/entity/Host';
import { mongoDocumentToHost, HostMongoDocument } from './HostMongoMapper';
import { Exception } from '../../../../common/error-handling/Exception';
import { Code } from '../../../../common/error-handling/Code';
import { UUID } from '../../../../common/domain/UUID';
import { uuidToMuuid } from '../../../../common/utils';
import { Country } from '../../../domain/data/Country';

@Injectable()
export class HostMongoRepositoryAdapter implements HostRepository {
  constructor(
    @InjectCollection('hosts')
    private readonly hostCollection: Collection<HostMongoDocument>,
  ) {}

  // This should always be used together with OrderRepository.addHostToOrder
  async addOrderToHost(
    hostId: UUID,
    orderId: UUID,
    transaction?: ClientSession,
  ): Promise<void> {
    await this.hostCollection
      .updateOne(
        { _id: uuidToMuuid(hostId) },
        {
          $push: {
            orderIds: uuidToMuuid(orderId),
          },
        },
        transaction ? { session: transaction } : undefined,
      )
      .catch(error => {
        throw new Exception(
          Code.INTERNAL_ERROR,
          `Host couldn't accept order and add order to host (orderId: ${orderId}, hostId: ${hostId}): ${error}`,
        );
      });
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
        transaction ? { session: transaction } : undefined,
      )
      .toArray();

    if (!hostDocuments.length) {
      throw new Exception(
        Code.ENTITY_NOT_FOUND_ERROR,
        `No available host (country: ${country})`,
        { country },
      );
    }

    const hostDocument = hostDocuments[0];
    return mongoDocumentToHost(hostDocument);
  }
}
