import { OrderUseCase } from './OrderUseCase';
import { EntityId } from '../../../common/domain/EntityId';
import { Country } from '../data/Country';
import { Item } from '../entity/Item';

export interface CreateOrderRequest {
  customerId: EntityId;
  originCountry: Country;
  items: Item[];
}

export abstract class CreateOrderUseCase extends OrderUseCase<
  CreateOrderRequest
> {}
