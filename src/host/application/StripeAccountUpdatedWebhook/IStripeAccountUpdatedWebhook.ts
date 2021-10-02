import { StripeEvent, UseCase } from '../../../common/application';
import {
  UpdateHostAccountPayload,
  UpdateHostAccountResult,
} from './handlers/UpdateHostAccountHandler/IUpdateHostAccountHandler';

export type StripeAccountUpdatedEvent = StripeEvent;

export type StripeAccountUpdatedWebhookPayload = UpdateHostAccountPayload;

export type StripeAccountUpdatedResult = UpdateHostAccountResult;

export abstract class IStripeAccountUpdatedWebhook {
  abstract execute(
    event: StripeAccountUpdatedEvent,
  ): Promise<StripeAccountUpdatedResult>;
}
