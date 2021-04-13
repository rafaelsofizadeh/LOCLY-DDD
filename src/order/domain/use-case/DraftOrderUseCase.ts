import { UUID } from '../../../common/domain/UUID';
import { Country } from '../data/Country';
import { Item } from '../entity/Item';
import { DraftedOrder } from '../entity/DraftedOrder';
import { UseCase } from '../../../common/domain/UseCase';

export interface DraftOrderRequest {
  customerId: UUID;
  originCountry: Country;
  items: Item[];
}

export abstract class DraftOrderUseCase extends UseCase<
  DraftOrderRequest,
  DraftedOrder
> {}
