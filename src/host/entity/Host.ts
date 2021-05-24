import { Address, Email, UUID } from '../../common/domain';
import { EntityFilter } from '../../common/persistence';
import { Country } from '../../order/entity/Country';

export type Host = Readonly<{
  id: UUID;
  email: Email;
  stripeAccountId: string;
  country: Country;
  firstName?: string;
  lastName?: string;
  address?: Address;
  orderIds?: UUID[];
  verified: boolean;
  available: boolean;
  profileComplete: boolean;
}>;

export type HostFilter = EntityFilter<Host, { hostId: UUID }>;

export type UnidHostRequest<T> = Omit<T, 'hostId'>;
