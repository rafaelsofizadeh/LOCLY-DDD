import { EntityId } from '../../../../common/domain/EntityId';
import { Item } from '../../entity/Item';

export interface CreateOrderRequestPort {
  customerId: EntityId;
  originCountry: string;
  items: Item[];
}
