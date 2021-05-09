import { StripeEvent, UseCase } from '../../../common/application';
import {
  ConfirmOrderHandlerRequest,
  ConfirmOrderHandlerResult,
} from './handlers/ConfirmOrderHandler/IConfirmOrderHandler';
import {
  PayShipmentHandlerRequest,
  PayShipmentHandlerResult,
} from './handlers/PayShipmentHandler/IPayShipmentHandler';

export enum FeeType {
  Service = 'locly_fee',
  Shipment = 'shipment_fee',
}

export type StripeCheckoutEvent = StripeEvent;

export type StripeCheckoutWebhookPayload = (
  | ConfirmOrderHandlerRequest
  | PayShipmentHandlerRequest
) & { feeType: FeeType };

export type StripeCheckoutResult =
  | ConfirmOrderHandlerResult
  | PayShipmentHandlerResult;

export abstract class IStripeCheckoutWebhook extends UseCase<
  StripeCheckoutEvent,
  StripeCheckoutResult
> {}
