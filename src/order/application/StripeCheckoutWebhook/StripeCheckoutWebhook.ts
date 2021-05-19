import { AuthnSkip } from '@eropple/nestjs-auth/dist';
import { StripeWebhookHandler } from '@golevelup/nestjs-stripe';
import { Injectable } from '@nestjs/common';
import {
  StripeCheckoutSession,
  StripeEvent,
} from '../../../common/application';
import { throwCustomException } from '../../../common/error-handling';
import {
  ConfirmOrderRequest,
  IConfirmOrderHandler,
} from './handlers/ConfirmOrderHandler/IConfirmOrderHandler';
import {
  PayShipmentRequest,
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

  // TODO: Don't run authinterceptor on webhooks
  @StripeWebhookHandler('checkout.session.completed')
  @AuthnSkip()
  execute(event: StripeEvent): Promise<StripeCheckoutResult> {
    const webhookPayload = (event.data.object as StripeCheckoutSession)
      .metadata as StripeCheckoutWebhookPayload;

    switch (webhookPayload.feeType) {
      case FeeType.Service:
        return this.confirmOrderWebhookGateway.execute(
          webhookPayload as ConfirmOrderRequest,
        );
      case FeeType.Shipment:
        return this.payShipmentWebhookGateway.execute(
          webhookPayload as PayShipmentRequest,
        );
      default:
        throwCustomException(
          "Unexpected Stripe 'checkout.session.completed' webhook type",
          { webhookPayload },
        )();
    }
  }
}
