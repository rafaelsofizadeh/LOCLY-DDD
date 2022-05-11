import { StripeEvent } from '../../../common/application';
import { UpdateHostAccountPayload, UpdateHostAccountResult } from './handlers/UpdateHostAccountHandler/IUpdateHostAccountHandler';
export declare type StripeAccountUpdatedEvent = StripeEvent;
export declare type StripeAccountUpdatedWebhookPayload = UpdateHostAccountPayload;
export declare type StripeAccountUpdatedResult = UpdateHostAccountResult;
export declare abstract class IStripeAccountUpdatedWebhook {
    abstract execute(event: StripeAccountUpdatedEvent): Promise<StripeAccountUpdatedResult>;
}
