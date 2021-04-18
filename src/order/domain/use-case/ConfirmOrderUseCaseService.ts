import Stripe from 'stripe';
import { UseCase } from '../../../common/domain/UseCase';
import { UUID } from '../../../common/domain/UUID';
import { ConfirmedOrder } from '../entity/ConfirmedOrder';

export abstract class ConfirmOrderUseCaseService extends UseCase<
  Omit<Stripe.Event, 'type'> & {
    type: Stripe.WebhookEndpointCreateParams.EnabledEvent;
  },
  { hostId: UUID }
> {}
