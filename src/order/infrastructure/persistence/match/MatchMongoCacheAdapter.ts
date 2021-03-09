import { Injectable } from '@nestjs/common';
import { Binary, Collection } from 'mongodb';
import { InjectCollection } from 'nest-mongodb';
import { MatchFixture } from '../../../../../test/e2e/fixture/MatchFixture';
import { EntityId } from '../../../../common/domain/EntityId';
import { entityIdToMuuid } from '../../../../common/utils';

// TODO(NOW(IMPORTANT)): Remove MatchRepository, record the match in Stripe metadata
// ^ No: https://stackoverflow.com/questions/55744094/stripe-checkout-wont-accept-metadata
// Doesn't work properly
// https://support.stripe.com/questions/using-metadata-with-checkout-sessions

import { Match, MatchCache } from '../../../application/port/MatchCache';
import {
  MatchMongoDocument,
  matchToMongoDocument,
  mongoDocumentToMatch,
} from './MatchMongoMapper';

@Injectable()
export class MatchMongoCacheAdapter implements MatchCache, MatchFixture {
  constructor(
    @InjectCollection('matches')
    private readonly matchCollection: Collection<MatchMongoDocument>,
  ) {}

  async recordMatch(match: Match): Promise<void> {
    this.matchCollection.insertOne(matchToMongoDocument(match));
  }

  async retrieveAndDeleteMatch(matchId: EntityId): Promise<Match> {
    const matchMongoBinaryId: Binary = entityIdToMuuid(matchId);
    const matchDocument: MatchMongoDocument = await this.matchCollection.findOne(
      { _id: matchMongoBinaryId },
    );

    // TODO(GLOBAL): "not found document" handling application-wide.

    await this.matchCollection.deleteOne({ _id: matchMongoBinaryId });

    return mongoDocumentToMatch(matchDocument);
  }

  // TODO: Redundancy with retrieveAndDeleteMatch
  // TODO: Make orderId and hostId mutually optional
  async findMatch(orderId: EntityId, hostId: EntityId): Promise<Match> {
    const orderMongoBinaryId: Binary = entityIdToMuuid(orderId);
    const hostMongoBinaryId: Binary = entityIdToMuuid(hostId);

    const matchDocument: MatchMongoDocument = await this.matchCollection.findOne(
      {
        $and: [{ orderId: orderMongoBinaryId }, { hostId: hostMongoBinaryId }],
      },
    );

    return mongoDocumentToMatch(matchDocument);
  }
}
