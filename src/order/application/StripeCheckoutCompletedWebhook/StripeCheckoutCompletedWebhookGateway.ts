import { StripeEvent, UseCase } from '../../../common/application';
import {
  ConfirmOrderRequest,
  ConfirmOrderResult,
} from './handlers/ConfirmOrderWebhookHandler/ConfirmOrderWebhookGateway';
import {
  PayOrderShipmentFeeRequest,
  PayOrderShipmentFeeResult,
} from './handlers/PayOrderShipmentFeeWebhookHandler/PayOrderShipmentFeeWebhookGateway';

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

export abstract class StripeCheckoutCompletedWebhookGateway extends UseCase<
  StripeCheckoutCompletedRequest,
  StripeCheckoutCompletedResult
> {}
