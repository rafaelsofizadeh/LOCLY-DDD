import { EntityId } from '../../../common/domain/EntityId';
import { Country } from '../data/Country';
import { Item } from '../entity/Item';
import { DraftedOrder } from '../entity/DraftedOrder';
import { UseCase } from '../../../common/domain/UseCase';

export interface CreateOrderRequest {
  customerId: EntityId;
  originCountry: Country;
  items: Item[];
}

export abstract class CreateOrderUseCase extends UseCase<
  CreateOrderRequest,
  DraftedOrder
> {}
