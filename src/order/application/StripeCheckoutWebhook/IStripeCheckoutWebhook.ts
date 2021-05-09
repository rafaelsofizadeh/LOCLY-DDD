import { StripeEvent, UseCase } from '../../../common/application';
import {
  ConfirmOrderHandlerRequest,
  ConfirmOrderHandlerResult,
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
  | ConfirmOrderHandlerRequest
  | PayShipmentRequest
) & { feeType: FeeType };

export type StripeCheckoutResult =
  | ConfirmOrderHandlerResult
  | PayShipmentResult;

export abstract class IStripeCheckoutWebhook extends UseCase<
  StripeCheckoutEvent,
  StripeCheckoutResult
> {}
