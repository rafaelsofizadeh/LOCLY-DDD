import Stripe from 'stripe';
import { UseCase } from '../../../../../common/application';

export type UpdateHostAccountRequest = Stripe.Account;

export type UpdateHostAccountResult = void;

export abstract class IUpdateHostAccount extends UseCase<
  UpdateHostAccountRequest,
  UpdateHostAccountResult
> {}
