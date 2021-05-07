import Stripe from 'stripe';
import { UseCase } from '../../../common/domain';

export abstract class PayOrderShipmentFeeUseCase extends UseCase<
  Omit<Stripe.Event, 'type'> & {
    type: Stripe.WebhookEndpointCreateParams.EnabledEvent;
  },
  void
> {}
