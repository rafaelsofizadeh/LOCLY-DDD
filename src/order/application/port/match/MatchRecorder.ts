import { ClientSession } from 'mongodb';
import { UUID } from '../../../../common/domain/UUID';

export type Match = {
  orderId: UUID;
  hostId: UUID;
};

export abstract class MatchRecorder {
  abstract recordMatch(
    orderId: UUID,
    hostId: UUID,
    transaction?: ClientSession,
  ): Promise<UUID>;

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
