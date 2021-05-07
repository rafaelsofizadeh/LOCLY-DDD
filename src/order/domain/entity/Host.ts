import { UUID } from '../../../common/domain';

import { Address } from './Order';

export type Host = Readonly<{
  id: UUID;
  address: Address;
  available: boolean;
  orderIds: UUID[];
}>;
