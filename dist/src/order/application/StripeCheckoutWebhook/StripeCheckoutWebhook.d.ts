import { StripeEvent } from '../../../common/application';
import { IConfirmOrderHandler } from './handlers/ConfirmOrderHandler/IConfirmOrderHandler';
import { IPayShipmentHandler } from './handlers/PayShipmentHandler/IPayShipmentHandler';
import { IStripeCheckoutWebhook } from './IStripeCheckoutWebhook';
export declare class StripeCheckoutWebhook implements IStripeCheckoutWebhook {
    private readonly confirmOrderWebhookGateway;
    private readonly payShipmentWebhookGateway;
    constructor(confirmOrderWebhookGateway: IConfirmOrderHandler, payShipmentWebhookGateway: IPayShipmentHandler);
    execute(event: StripeEvent): Promise<void>;
}
