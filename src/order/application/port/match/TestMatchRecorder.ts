import { ClientSession } from 'mongodb';
import { UUID } from '../../../../common/domain/UUID';
import { Match } from './MatchRecorder';

export abstract class TestMatchRecorder {
  abstract recordMatch(
    orderId: UUID,
    hostId: UUID,
    transaction?: ClientSession,
  ): Promise<void>;

  abstract retrieveAndDeleteMatch(
    matchId: UUID,
    transaction?: ClientSession,
  ): Promise<Match>;

  abstract findMatch(
    orderId: UUID,
    hostId: UUID,
    transaction?: ClientSession,
  ): Promise<Match>;
}
