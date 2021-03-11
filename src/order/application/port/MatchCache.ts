import { EntityId } from '../../../common/domain/EntityId';

// TODO/DECIDE: id is specifically a string (Stripe.Checkout.Session['client_reference_id']),
// and not an EntityId, because Match is a simple data object with no behaviour.
export type Match = {
  id: EntityId;
  orderId: EntityId;
  hostId: EntityId;
};

export abstract class MatchCache {
  abstract recordMatch(match: Match): Promise<void>;
  abstract retrieveAndDeleteMatch(matchId: EntityId): Promise<Match>;
}
