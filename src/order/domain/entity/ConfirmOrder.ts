import { UUID } from '../../../common/domain';
import { Country } from '../data/Country';
import { ConfirmedOrderStatus } from './Order';

export interface ConfirmOrder {
  readonly id: UUID;
  readonly status: typeof ConfirmedOrderStatus;
  readonly customerId: UUID;
  readonly originCountry: Country;
  readonly hostId: UUID;
}
