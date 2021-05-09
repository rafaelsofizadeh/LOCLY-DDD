import { StripeEvent, UseCase } from '../../../common/application';
import {
  ConfirmOrderRequest,
  ConfirmOrderResult,
} from './handlers/ConfirmOrderWebhookHandler/ConfirmOrderWebhookGateway';
import {
  PayShipmentRequest,
  PayShipmentResult,
} from './handlers/PayShipmentWebhookHandler/PayShipmentWebhookGateway';

export enum StripeCheckoutCompletedWebhookFeeType {
  Service = 'locly_fee',
  Shipment = 'shipment_fee',
}

export type StripeCheckoutCompletedRequest = StripeEvent;

export type StripeCheckoutCompletedWebhookPayload = (
  | ConfirmOrderRequest
  | PayShipmentRequest
) & { feeType: StripeCheckoutCompletedWebhookFeeType };

export type StripeCheckoutCompletedResult =
  | ConfirmOrderResult
  | PayShipmentResult;

export abstract class StripeCheckoutCompletedWebhookGateway extends UseCase<
  StripeCheckoutCompletedRequest,
  StripeCheckoutCompletedResult
> {}
