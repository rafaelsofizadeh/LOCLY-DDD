import Stripe from 'stripe';
import { UseCase } from '../../../common/domain/UseCase';
import { UUID } from '../../../common/domain/UUID';

export interface HostMatchResult {
  matchedHostId: UUID;
}

export abstract class ConfirmOrderUseCaseService extends UseCase<
  Omit<Stripe.Event, 'type'> & {
    type: Stripe.WebhookEndpointCreateParams.EnabledEvent;
  },
  HostMatchResult
> {}
