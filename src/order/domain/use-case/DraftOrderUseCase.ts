import { UUID } from '../../../common/domain';
import { Country } from '../data/Country';
import { Item } from '../entity/Item';
import { DraftOrder } from '../entity/DraftOrder';
import { UseCase } from '../../../common/domain';
import { Address } from '../entity/Address';
import { WithoutId } from '../../../common/domain';

export interface DraftOrderRequest {
  customerId: UUID;
  originCountry: Country;
  destination: Address;
  items: WithoutId<Item>[];
}

export abstract class DraftOrderUseCase extends UseCase<
  DraftOrderRequest,
  DraftOrder
> {}
