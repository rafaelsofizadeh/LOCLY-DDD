import Stripe from 'stripe';
import { UseCase } from '../../../common/domain/UseCase';
import { ConfirmedOrder } from '../entity/ConfirmedOrder';

export abstract class FinalizeOrderUseCase extends UseCase<
  Omit<Stripe.Event, 'type'> & {
    type: Stripe.WebhookEndpointCreateParams.EnabledEvent;
  },
  ConfirmedOrder
> {}
