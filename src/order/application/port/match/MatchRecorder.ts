import { ClientSession } from 'mongodb';
import { UUID } from '../../../../common/domain/UUID';

// TODO/DECIDE: id is specifically a string (Stripe.Checkout.Session['client_reference_id']),
// and not an UUID, because Match is a simple data object with no behaviour.
export type Match = {
  orderId: UUID;
  hostId: UUID;
};

export abstract class MatchRecorder {
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
