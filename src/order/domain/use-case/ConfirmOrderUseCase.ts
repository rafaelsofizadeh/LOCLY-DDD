import Stripe from 'stripe';
import { UseCase } from '../../../common/domain';
import { Address } from '../entity/Address';

export interface HostMatchResult {
  matchedHostAddress: Address;
}

export abstract class ConfirmOrderUseCase extends UseCase<
  Omit<Stripe.Event, 'type'> & {
    type: Stripe.WebhookEndpointCreateParams.EnabledEvent;
  },
  HostMatchResult
> {}
