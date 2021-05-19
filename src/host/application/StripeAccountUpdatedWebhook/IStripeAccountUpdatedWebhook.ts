import { StripeEvent, UseCase } from '../../../common/application';
import {
  UpdateHostAccountRequest,
  UpdateHostAccountResult,
} from './handlers/UpdateHostAccountHandler/IUpdateHostAccountHandler';

export type StripeAccountUpdatedEvent = StripeEvent;

export type StripeAccountUpdatedWebhookPayload = UpdateHostAccountRequest;

export type StripeAccountUpdatedResult = UpdateHostAccountResult;

export abstract class IStripeAccountUpdatedWebhook extends UseCase<
  StripeAccountUpdatedEvent,
  StripeAccountUpdatedResult
> {}
