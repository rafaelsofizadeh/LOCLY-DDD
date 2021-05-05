import { UUID } from '../../../common/domain';

import { Address } from './Address';

export interface Customer {
  id: UUID;
  selectedAddress: Address;
  orderIds: UUID[];
}
