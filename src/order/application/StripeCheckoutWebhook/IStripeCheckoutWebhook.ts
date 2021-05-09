import { StripeEvent, UseCase } from '../../../common/application';
import {
  ConfirmOrderRequest,
  ConfirmOrderResult,
} from './handlers/ConfirmOrderHandler/IConfirmOrderHandler';
import {
  PayShipmentRequest,
  PayShipmentResult,
} from './handlers/PayShipmentHandler/IPayShipmentHandler';

export enum FeeType {
  Service = 'locly_fee',
  Shipment = 'shipment_fee',
}

export type StripeCheckoutEvent = StripeEvent;

export type StripeCheckoutWebhookPayload = (
  | ConfirmOrderRequest
  | PayShipmentRequest
) & { feeType: FeeType };

export type StripeCheckoutResult = ConfirmOrderResult | PayShipmentResult;

export abstract class IStripeCheckoutWebhook extends UseCase<
  StripeCheckoutEvent,
  StripeCheckoutResult
> {}
