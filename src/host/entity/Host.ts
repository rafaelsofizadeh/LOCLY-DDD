import { Email, UUID } from '../../common/domain';
import { EntityFilter } from '../../common/persistence';

import { Address } from '../../order/entity/Order';

export type Host = Readonly<{
  id: UUID;
  email: Email;
  stripeAccountId: string;
  onboarded: boolean;
  available: boolean;
  address?: Address;
  orderIds?: UUID[];
}>;

export type HostFilter = EntityFilter<Host, { hostId: UUID }>;
