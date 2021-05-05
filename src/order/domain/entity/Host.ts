import { UUID } from '../../../common/domain';

import { Address } from './Order';

export interface Host {
  id: UUID;
  address: Address;
  available: boolean;
  orderIds: UUID[];
}
