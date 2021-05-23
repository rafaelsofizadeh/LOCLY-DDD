import { StripeEvent, UseCase } from '../../../common/application';
import {
  ConfirmOrderWebhookPayload,
  ConfirmOrderWebhookResult,
} from './handlers/ConfirmOrderHandler/IConfirmOrderHandler';
import {
  PayShipmentWebhookPayload,
  PayShipmentWebhookResult,
} from './handlers/PayShipmentHandler/IPayShipmentHandler';

export enum FeeType {
  Service = 'locly_fee',
  Shipment = 'shipment_fee',
}

export type StripeCheckoutEvent = StripeEvent;

export type StripeCheckoutWebhookPayload = (
  | ConfirmOrderWebhookPayload
  | PayShipmentWebhookPayload
) & { feeType: FeeType };

export type StripeCheckoutResult =
  | ConfirmOrderWebhookResult
  | PayShipmentWebhookResult;

export abstract class IStripeCheckoutWebhook extends UseCase<
  StripeCheckoutEvent,
  StripeCheckoutResult
> {}
