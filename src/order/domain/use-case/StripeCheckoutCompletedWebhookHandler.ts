import { StripeEvent } from '../../../common/application';
import { UseCase } from '../../../common/domain';
import { ConfirmOrderRequest, ConfirmOrderResult } from './ConfirmOrderUseCase';
import {
  PayOrderShipmentFeeRequest,
  PayOrderShipmentFeeResult,
} from './PayOrderShipmentFeeUseCase';

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
