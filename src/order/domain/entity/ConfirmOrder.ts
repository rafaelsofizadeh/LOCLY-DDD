import { UUID } from '../../../common/domain';
import { Country } from '../data/Country';

export interface ConfirmOrder {
  readonly id: UUID;
  readonly customerId: UUID;
  readonly originCountry: Country;
  readonly hostId: UUID;
}
