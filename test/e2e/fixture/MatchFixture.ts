import { EntityId } from '../../../src/common/domain/EntityId';
import { Match } from '../../../src/order/application/port/MatchCache';

// TODO: Potential redundancy with MatchCache
export abstract class MatchFixture {
  abstract findMatch(orderId: EntityId, hostId: EntityId): Promise<Match>;
}
