import Stripe from 'stripe';
import { Address, Email, UUID } from '../../common/domain';
import { EntityFilter } from '../../common/persistence';
import { Country } from '../../order/entity/Country';
export declare type Host = Readonly<{
    id: UUID;
    email: Email;
    stripeAccountId: Stripe.Account['id'];
    country: Country;
    firstName?: string;
    lastName?: string;
    address?: Address;
    orderIds: UUID[];
    verified: boolean;
    available: boolean;
    profileComplete: boolean;
}>;
export declare type SerializedHost = Omit<Host, 'stripeAccountId'>;
export declare type HostFilter = EntityFilter<Host, {
    hostId: UUID;
}>;
export declare type UnidHostRequest<T> = Omit<T, 'hostId'>;
