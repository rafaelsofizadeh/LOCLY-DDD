import Stripe from 'stripe';
import { Address, Email, UUID } from '../../common/domain';
import { EntityFilter } from '../../common/persistence';

export type Customer = Readonly<{
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

export type SerializedCustomer = Omit<Customer, 'stripeCustomerId'>;

export type CustomerFilter = EntityFilter<Customer, { customerId: UUID }>;

export type UnidCustomerRequest<T> = Omit<T, 'customerId'>;
