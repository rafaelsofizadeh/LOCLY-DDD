import Stripe from 'stripe';
import { Address, Email, UUID } from '../../common/domain';
import { EntityFilter } from '../../common/persistence';
export declare type Customer = Readonly<{
    id: UUID;
    email: Email;
    firstName?: string;
    lastName?: string;
    phone?: string;
    balanceUsdCents: number;
    referralCode: string;
    refereeCustomerId?: Customer['id'];
    stripeCustomerId: Stripe.Customer['id'];
    addresses: Address[];
    orderIds: UUID[];
}>;
export declare type SerializedCustomer = Omit<Customer, 'stripeCustomerId'>;
export declare type CustomerFilter = EntityFilter<Customer, {
    customerId: UUID;
}>;
export declare type UnidCustomerRequest<T> = Omit<T, 'customerId'>;
