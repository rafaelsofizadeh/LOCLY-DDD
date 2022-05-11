import Stripe from 'stripe';
import { IHostRepository } from '../../../host/persistence/IHostRepository';
import { TransactionUseCasePort } from '../../../common/application';
import { Host } from '../../entity/Host';
import { CreateHostPayload, ICreateHost } from './ICreateHost';
import { Country } from '../../../order/entity/Country';
export declare class CreateHost implements ICreateHost {
    private readonly hostRepository;
    private readonly stripe;
    private readonly stripeSupportedCountries;
    constructor(hostRepository: IHostRepository, stripe: Stripe);
    execute({ port: createHostPayload, mongoTransactionSession, }: TransactionUseCasePort<CreateHostPayload>): Promise<Host>;
    private createHost;
    createHostStripeAccount({ email, country, }: {
        email: string;
        country: Country;
    }): Promise<Stripe.Account>;
}
