import Stripe from 'stripe';
import { OrderUseCase } from './OrderUseCase';

export abstract class FinalizeOrderUseCase extends OrderUseCase<
  Omit<Stripe.Event, 'type'> & {
    type: Stripe.WebhookEndpointCreateParams.EnabledEvent;
  }
> {}
