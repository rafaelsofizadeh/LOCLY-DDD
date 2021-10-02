import { StripeWebhookHandler } from '@golevelup/nestjs-stripe';
import { Injectable } from '@nestjs/common';
import {
  StripeCheckoutSession,
  StripeEvent,
} from '../../../common/application';
import { throwCustomException } from '../../../common/error-handling';
import {
  ConfirmOrderWebhookPayload,
  IConfirmOrderHandler,
} from './handlers/ConfirmOrderHandler/IConfirmOrderHandler';
import {
  PayShipmentWebhookPayload,
  IPayShipmentHandler,
} from './handlers/PayShipmentHandler/IPayShipmentHandler';
import {
  StripeCheckoutResult,
  IStripeCheckoutWebhook,
  FeeType,
  StripeCheckoutWebhookPayload,
} from './IStripeCheckoutWebhook';

@Injectable()
export class StripeCheckoutWebhook implements IStripeCheckoutWebhook {
  constructor(
    private readonly confirmOrderWebhookGateway: IConfirmOrderHandler,
    private readonly payShipmentWebhookGateway: IPayShipmentHandler,
  ) {}

  @StripeWebhookHandler('checkout.session.completed')
  async execute(event: StripeEvent): Promise<void> {
    const session = event.data.object as StripeCheckoutSession;
    const webhookPayload = session.metadata as StripeCheckoutWebhookPayload;

    //https://stripe.com/docs/payments/checkout/fulfill-orders
    switch (webhookPayload.feeType) {
      case FeeType.Service:
        await this.confirmOrderWebhookGateway.execute({
          port: webhookPayload as ConfirmOrderWebhookPayload,
        });
        break;
      case FeeType.Shipment:
        await this.payShipmentWebhookGateway.execute({
          port: webhookPayload as PayShipmentWebhookPayload,
        });
        break;
      default:
        throwCustomException(
          "Unexpected Stripe 'checkout.session.completed' webhook type",
          { webhookPayload },
        )();
    }

    // Stripe webhooks should receive a successful 20X HTTP response as fast as possible.
    return;
  }
}
