import { Address, Email, UUID } from '../../common/domain';
import { EntityFilter } from '../../common/persistence';

export type Customer = Readonly<{
  id: UUID;
  email: Email;
  addresses: Address[];
  orderIds: UUID[];
}>;

export type CustomerFilter = EntityFilter<Customer, { customerId: UUID }>;
