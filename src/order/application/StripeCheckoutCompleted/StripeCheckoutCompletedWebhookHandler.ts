import { StripeWebhookHandler } from '@golevelup/nestjs-stripe';
import { Injectable } from '@nestjs/common';
import {
  StripeCheckoutSession,
  StripeEvent,
} from '../../../common/application';
import { throwCustomException } from '../../../common/error-handling';
import {
  ConfirmOrderRequest,
  ConfirmOrderUseCase,
} from '../ConfirmOrder/ConfirmOrderUseCase';
import {
  PayOrderShipmentFeeRequest,
  PayOrderShipmentFeeUseCase,
} from '../PayOrderShipmentFee/PayOrderShipmentFeeUseCase';
import {
  StripeCheckoutCompletedResult,
  StripeCheckoutCompletedUseCase,
  StripeCheckoutCompletedWebhookFeeType,
  StripeCheckoutCompletedWebhookPayload,
} from './StripeCheckoutCompletedUseCase';

@Injectable()
export class StripeCheckoutCompletedWebhookHandler
  implements StripeCheckoutCompletedUseCase {
  constructor(
    private readonly confirmOrderUseCase: ConfirmOrderUseCase,
    private readonly payOrderShipmentFeeUseCase: PayOrderShipmentFeeUseCase,
  ) {}

  @StripeWebhookHandler('checkout.session.completed')
  execute(event: StripeEvent): Promise<StripeCheckoutCompletedResult> {
    const webhookPayload = (event.data.object as StripeCheckoutSession)
      .metadata as StripeCheckoutCompletedWebhookPayload;

    switch (webhookPayload.feeType) {
      case StripeCheckoutCompletedWebhookFeeType.Service:
        return this.confirmOrderUseCase.execute(
          webhookPayload as ConfirmOrderRequest,
        );
      case StripeCheckoutCompletedWebhookFeeType.Shipment:
        return this.payOrderShipmentFeeUseCase.execute(
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
