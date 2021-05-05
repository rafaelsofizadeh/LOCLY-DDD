import { UUID } from '../../../common/domain';

import { Address } from './Address';

export interface Host {
  id: UUID;
  address: Address;
  available: boolean;
  orderIds: UUID[];
}
