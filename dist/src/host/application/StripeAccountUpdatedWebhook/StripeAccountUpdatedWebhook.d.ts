import { StripeEvent } from '../../../common/application';
import { IUpdateHostAccount } from './handlers/UpdateHostAccountHandler/IUpdateHostAccountHandler';
import { IStripeAccountUpdatedWebhook, StripeAccountUpdatedResult } from './IStripeAccountUpdatedWebhook';
export declare class StripeAccountUpdatedWebhook implements IStripeAccountUpdatedWebhook {
    private readonly updateHostAccountWebhookGateway;
    constructor(updateHostAccountWebhookGateway: IUpdateHostAccount);
    execute(event: StripeEvent): Promise<StripeAccountUpdatedResult>;
}
