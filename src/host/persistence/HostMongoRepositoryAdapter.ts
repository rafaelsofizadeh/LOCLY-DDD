import {
  ClientSession,
  Collection,
  DeleteWriteOpResultObject,
  FilterQuery,
  InsertWriteOpResult,
  UpdateWriteOpResult,
} from 'mongodb';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectCollection } from 'nest-mongodb';

import { IHostRepository } from './IHostRepository';
import { Host, HostFilter } from '../entity/Host';
import {
  mongoDocumentToHost,
  HostMongoDocument,
  hostToMongoDocument,
  normalizeHostFilter,
} from './HostMongoMapper';
import {
  expectOnlyNResults,
  expectOnlySingleResult,
  throwCustomException,
} from '../../common/error-handling';
import { UUID } from '../../common/domain';
import { Country } from '../../order/entity/Country';
import { mongoQuery, uuidToMuuid } from '../../common/persistence';
import { isNotEmptyObject } from 'class-validator';

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

    const {
      insertedCount,
    }: InsertWriteOpResult<HostMongoDocument> = await this.hostCollection
      .insertMany(hostDocuments, { session: mongoTransactionSession })
      .catch(throwCustomException('Error adding many hosts', { hosts }));

    expectOnlyNResults(hosts.length, [insertedCount], {
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
    const {
      deletedCount,
    }: DeleteWriteOpResultObject = await this.hostCollection
      .deleteMany(
        { _id: { $in: hostIds.map(hostId => uuidToMuuid(hostId)) } },
        { session: mongoTransactionSession },
      )
      .catch(throwCustomException('Error deleting many hosts', { hostIds }));

    expectOnlyNResults(hostIds.length, [deletedCount], {
      operation: 'deleting',
      entity: 'host',
    });
  }

  async deleteHost(
    filter: HostFilter,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    const filterWithId = normalizeHostFilter(filter);
    const filterQuery: FilterQuery<HostMongoDocument> = mongoQuery(
      filterWithId,
    );

    const {
      deletedCount,
    }: DeleteWriteOpResultObject = await this.hostCollection
      .deleteOne(filterQuery, { session: mongoTransactionSession })
      .catch(throwCustomException("Couldn't delete host", filter));

    expectOnlySingleResult([deletedCount], {
      operation: 'deleting',
      entity: 'host',
    });
  }

  async setProperties(
    filter: HostFilter,
    // TODO: better type naming for OrderFilter here
    properties: Omit<HostFilter, 'hostId'>,
    mongoTransactionSession?: ClientSession,
  ) {
    if (!isNotEmptyObject(filter) || !isNotEmptyObject(properties)) {
      return;
    }

    const filterWithId = normalizeHostFilter(filter);
    const filterQuery: FilterQuery<HostMongoDocument> = mongoQuery(
      filterWithId,
    );

    const updateQuery = mongoQuery(properties);

    // https://docs.mongodb.com/manual/reference/method/WriteResult/#mongodb-data-WriteResult.nModified
    // "If the update/replacement operation results in no change to the document, such as setting the
    // value of the field to its current value, nModified can be less than nMatched."
    await this.hostCollection
      .updateOne(
        filterQuery,
        { $set: updateQuery },
        { session: mongoTransactionSession },
      )
      .catch(
        throwCustomException('Error updating host', {
          filter,
          properties,
        }),
      );
  }

  // This should always be used together with IOrderRepository.addHostToOrder
  async addOrderToHost(
    filter: HostFilter,
    orderId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<void> {
    const filterWithId = normalizeHostFilter(filter);
    const filterQuery: FilterQuery<HostMongoDocument> = mongoQuery(
      filterWithId,
    );

    const {
      matchedCount,
      modifiedCount,
    }: UpdateWriteOpResult = await this.hostCollection
      .updateOne(
        filterQuery,
        { $push: { orderIds: uuidToMuuid(orderId) } },
        { session: mongoTransactionSession },
      )
      .catch(
        throwCustomException('Error adding order to host', {
          hostFilter: filter,
          orderId,
        }),
      );

    expectOnlySingleResult([matchedCount, modifiedCount], {
      operation: 'adding order to',
      entity: 'host',
    });
  }

  async findHost(
    filter: HostFilter,
    mongoTransactionSession?: ClientSession,
    throwIfNotFound: boolean = true,
  ): Promise<Host> {
    const filterWithId = normalizeHostFilter(filter);
    const filterQuery: FilterQuery<HostMongoDocument> = mongoQuery(
      filterWithId,
    );

    const hostDocument: HostMongoDocument = await this.hostCollection
      .findOne(filterQuery, { session: mongoTransactionSession })
      .catch(throwCustomException('Error searching for a host', filter));

    if (!hostDocument) {
      if (throwIfNotFound) {
        throwCustomException('No host found', filter, HttpStatus.NOT_FOUND)();
      }

      return;
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
