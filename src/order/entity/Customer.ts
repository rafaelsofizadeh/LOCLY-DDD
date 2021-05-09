import { UUID } from '../../common/domain';

import { Address } from './Order';

export type Customer = Readonly<{
  id: UUID;
  selectedAddress: Address;
  orderIds: UUID[];
}>;
