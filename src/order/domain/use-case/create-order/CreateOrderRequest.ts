import { EntityId } from '../../../../common/domain/EntityId';
import { Item } from '../../entity/Item';

export interface CreateOrderRequest {
  customerId: EntityId;
  originCountry: string;
  items: Item[];
}
