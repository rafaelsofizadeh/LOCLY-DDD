import { StripeEvent } from '../../../common/application';
import { ConfirmOrderWebhookPayload, ConfirmOrderWebhookResult } from './handlers/ConfirmOrderHandler/IConfirmOrderHandler';
import { PayShipmentWebhookPayload, PayShipmentWebhookResult } from './handlers/PayShipmentHandler/IPayShipmentHandler';
export declare enum FeeType {
    Service = "locly_fee",
    Shipment = "shipment_fee"
}
export declare type StripeCheckoutEvent = StripeEvent;
export declare type StripeCheckoutWebhookPayload = (ConfirmOrderWebhookPayload | PayShipmentWebhookPayload) & {
    feeType: FeeType;
};
export declare type StripeCheckoutResult = ConfirmOrderWebhookResult | PayShipmentWebhookResult;
export declare abstract class IStripeCheckoutWebhook {
    abstract execute(event: StripeCheckoutEvent): Promise<void>;
}
