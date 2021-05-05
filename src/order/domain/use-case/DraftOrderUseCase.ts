import { UUID } from '../../../common/domain';
import { Country } from '../data/Country';
import { Item } from '../entity/Item';
import { Address, DraftOrder } from '../entity/Order';
import { UseCase } from '../../../common/domain';
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
