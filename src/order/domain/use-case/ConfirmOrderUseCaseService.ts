import Stripe from 'stripe';
import { UseCase } from '../../../common/domain/UseCase';
import { ConfirmedOrder } from '../entity/ConfirmedOrder';

export abstract class ConfirmOrderUseCaseService extends UseCase<
  Omit<Stripe.Event, 'type'> & {
    type: Stripe.WebhookEndpointCreateParams.EnabledEvent;
  },
  ConfirmedOrder
> {}
