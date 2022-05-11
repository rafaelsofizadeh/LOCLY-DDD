import Stripe from 'stripe';
import { GetHostAccountLinkPayload, HostAccountLink, IGetHostAccountLink } from './IGetHostAccountLink';
export declare class GetHostAccountLink implements IGetHostAccountLink {
    private readonly stripe;
    constructor(stripe: Stripe);
    execute({ port, }: {
        port: GetHostAccountLinkPayload;
    }): Promise<HostAccountLink>;
    private generateHostStripeAccountLink;
}
