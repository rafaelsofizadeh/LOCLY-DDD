import { UUID } from '../../../common/domain/UUID';
import { Country } from '../data/Country';
import { Item } from '../entity/Item';
import { DraftedOrder } from '../entity/DraftedOrder';
import { UseCase } from '../../../common/domain/UseCase';

export interface CreateOrderRequest {
  customerId: UUID;
  originCountry: Country;
  items: Item[];
}

export abstract class CreateOrderUseCase extends UseCase<
  CreateOrderRequest,
  DraftedOrder
> {}
