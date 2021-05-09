import { StripeEvent, UseCase } from '../../../common/application';
import {
  ConfirmOrderRequest,
  ConfirmOrderResult,
} from '../ConfirmOrder/ConfirmOrderUseCase';
import {
  PayOrderShipmentFeeRequest,
  PayOrderShipmentFeeResult,
} from '../PayOrderShipmentFee/PayOrderShipmentFeeUseCase';

export enum StripeCheckoutCompletedWebhookFeeType {
  Service = 'locly_fee',
  Shipment = 'shipment_fee',
}

export type StripeCheckoutCompletedRequest = StripeEvent;

export type StripeCheckoutCompletedWebhookPayload = (
  | ConfirmOrderRequest
  | PayOrderShipmentFeeRequest
) & { feeType: StripeCheckoutCompletedWebhookFeeType };

export type StripeCheckoutCompletedResult =
  | ConfirmOrderResult
  | PayOrderShipmentFeeResult;

export abstract class StripeCheckoutCompletedUseCase extends UseCase<
  StripeCheckoutCompletedRequest,
  StripeCheckoutCompletedResult
> {}
