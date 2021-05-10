import {
  ClientSession,
  Collection,
  DeleteWriteOpResultObject,
  InsertWriteOpResult,
  UpdateWriteOpResult,
} from 'mongodb';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectCollection } from 'nest-mongodb';

import { IHostRepository } from './IHostRepository';
import { Host } from '../../order/entity/Host';
import {
  mongoDocumentToHost,
  HostMongoDocument,
  hostToMongoDocument,
} from './HostMongoMapper';
import {
  expectOnlyNResults,
  expectOnlySingleResult,
  throwCustomException,
} from '../../common/error-handling';
import { UUID } from '../../common/domain';
import { Country } from '../../order/entity/Country';
import { uuidToMuuid } from '../../common/persistence';

@Injectable()
export class HostMongoRepositoryAdapter implements IHostRepository {
  constructor(
    @InjectCollection('hosts')
    private readonly hostCollection: Collection<HostMongoDocument>,
  ) {}

  // For testing
  async addManyHosts(
    hosts: Host[],
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    const hostDocuments: HostMongoDocument[] = hosts.map(hostToMongoDocument);

    const result: InsertWriteOpResult<HostMongoDocument> = await this.hostCollection
      .insertMany(hostDocuments, { session: mongoTransactionSession })
      .catch(throwCustomException('Error adding many hosts', { hosts }));

    expectOnlyNResults(hosts.length, [result.insertedCount], {
      operation: 'inserting',
      entity: 'host',
    });
  }

  async addHost(
    host: Host,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    const hostDocument: HostMongoDocument = hostToMongoDocument(host);

    await this.hostCollection
      .insertOne(hostDocument, { session: mongoTransactionSession })
      .catch(throwCustomException('Error adding host', { host }));
  }

  // For testing
  async deleteManyHosts(
    hostIds: UUID[],
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    const result: DeleteWriteOpResultObject = await this.hostCollection
      .deleteMany(
        { _id: { $in: hostIds.map(hostId => uuidToMuuid(hostId)) } },
        { session: mongoTransactionSession },
      )
      .catch(throwCustomException('Error deleting many hosts', { hostIds }));

    expectOnlyNResults(hostIds.length, [result.deletedCount], {
      operation: 'deleting',
      entity: 'host',
    });
  }

  async deleteHost(
    hostId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    const deleteResult: DeleteWriteOpResultObject = await this.hostCollection
      .deleteOne(
        { _id: uuidToMuuid(hostId) },
        { session: mongoTransactionSession },
      )
      .catch(
        throwCustomException("Couldn't delete host", {
          hostId,
        }),
      );

    expectOnlySingleResult([deleteResult.deletedCount], {
      operation: 'deleting',
      entity: 'host',
    });
  }

  // This should always be used together with IOrderRepository.addHostToOrder
  async addOrderToHost(
    hostId: UUID,
    orderId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    const updateResult: UpdateWriteOpResult = await this.hostCollection
      .updateOne(
        { _id: uuidToMuuid(hostId) },
        { $push: { orderIds: uuidToMuuid(orderId) } },
        { session: mongoTransactionSession },
      )
      .catch(
        throwCustomException('Error adding order to host', {
          hostId,
          orderId,
        }),
      );

    expectOnlySingleResult(
      [updateResult.matchedCount, updateResult.modifiedCount],
      {
        operation: 'adding order to',
        entity: 'host',
      },
    );
  }

  async findHost(
    hostId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<Host> {
    const hostDocument: HostMongoDocument = await this.hostCollection
      .findOne(
        { _id: uuidToMuuid(hostId) },
        { session: mongoTransactionSession },
      )
      .catch(throwCustomException('Error searching for a host', { hostId }));

    if (!hostDocument) {
      throwCustomException('No host found', { hostId }, HttpStatus.NOT_FOUND)();
    }

    return mongoDocumentToHost(hostDocument);
  }

  async findHostAvailableInCountryWithMinimumNumberOfOrders(
    country: Country,
    mongoTransactionSession?: ClientSession,
  ): Promise<Host> {
    // Finding max value in array:
    // https://stackoverflow.com/questions/32076382/mongodb-how-to-get-max-value-from-collections

    // Sorting by array length: https://stackoverflow.com/a/54529224/6539857

    // $sort + $limit coalescense: https://docs.mongodb.com/manual/reference/method/cursor.sort/#limit-results

    // Destructuring the first element because the result is limited to 1
    const [hostDocument]: HostMongoDocument[] = await this.hostCollection
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
        { session: mongoTransactionSession },
      )
      .toArray()
      .catch(
        throwCustomException('Error searching for available hosts', {
          country,
        }),
      );

    if (!hostDocument) {
      throwCustomException(
        'No host found',
        { country },
        HttpStatus.NOT_FOUND,
      )();
    }

    return mongoDocumentToHost(hostDocument);
  }
}
