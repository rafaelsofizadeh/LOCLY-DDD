import { StripeWebhookHandler } from '@golevelup/nestjs-stripe';
import { Injectable } from '@nestjs/common';
import {
  StripeCheckoutSession,
  StripeEvent,
} from '../../../common/application';
import { throwCustomException } from '../../../common/error-handling';
import {
  ConfirmOrderRequest,
  ConfirmOrderWebhookGateway,
} from './handlers/ConfirmOrderWebhookHandler/ConfirmOrderWebhookGateway';
import {
  PayOrderShipmentFeeRequest,
  PayOrderShipmentFeeWebhookGateway,
} from './handlers/PayOrderShipmentFeeWebhookHandler/PayOrderShipmentFeeWebhookGateway';
import {
  StripeCheckoutCompletedResult,
  StripeCheckoutCompletedWebhookGateway,
  StripeCheckoutCompletedWebhookFeeType,
  StripeCheckoutCompletedWebhookPayload,
} from './StripeCheckoutCompletedWebhookGateway';

@Injectable()
export class StripeCheckoutCompletedWebhookHandler
  implements StripeCheckoutCompletedWebhookGateway {
  constructor(
    private readonly confirmOrderWebhookGateway: ConfirmOrderWebhookGateway,
    private readonly payOrderShipmentFeeWebhookGateway: PayOrderShipmentFeeWebhookGateway,
  ) {}

  @StripeWebhookHandler('checkout.session.completed')
  execute(event: StripeEvent): Promise<StripeCheckoutCompletedResult> {
    const webhookPayload = (event.data.object as StripeCheckoutSession)
      .metadata as StripeCheckoutCompletedWebhookPayload;

    switch (webhookPayload.feeType) {
      case StripeCheckoutCompletedWebhookFeeType.Service:
        return this.confirmOrderWebhookGateway.execute(
          webhookPayload as ConfirmOrderRequest,
        );
      case StripeCheckoutCompletedWebhookFeeType.Shipment:
        return this.payOrderShipmentFeeWebhookGateway.execute(
          webhookPayload as PayOrderShipmentFeeRequest,
        );
      default:
        throwCustomException(
          "Unexpected Stripe 'checkout.session.completed' webhook type",
          { webhookPayload },
        )();
    }
  }
}
