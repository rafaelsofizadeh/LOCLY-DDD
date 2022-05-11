import Stripe from 'stripe';
import { UseCase } from '../../../common/application';
import { Email } from '../../../common/domain';
import { Country } from '../../../order/entity/Country';
import { Host } from '../../entity/Host';
export declare type CreateHostPayload = Readonly<{
    email: Email;
    country: Country;
}>;
export declare abstract class ICreateHost extends UseCase<CreateHostPayload, Host> {
    abstract createHostStripeAccount(properties: Partial<Stripe.Account>): Promise<Stripe.Account>;
}
