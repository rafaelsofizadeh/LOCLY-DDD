import Stripe from 'stripe';
import { UseCase } from '../../../../../common/application';
export declare type UpdateHostAccountPayload = Stripe.Account;
export declare type UpdateHostAccountResult = void;
export declare abstract class IUpdateHostAccount extends UseCase<UpdateHostAccountPayload, UpdateHostAccountResult> {
}
