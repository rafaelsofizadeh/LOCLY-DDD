import { Address, Email, UUID } from '../../common/domain';
import { EntityFilter } from '../../common/persistence';

export type Host = Readonly<{
  id: UUID;
  email: Email;
  stripeAccountId: string;
  verified: boolean;
  available: boolean;
  address?: Address;
  orderIds?: UUID[];
}>;

export type HostFilter = EntityFilter<Host, { hostId: UUID }>;
