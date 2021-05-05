import { UUID } from '../../../common/domain';

import { Address } from './Order';

export interface Customer {
  id: UUID;
  selectedAddress: Address;
  orderIds: UUID[];
}
