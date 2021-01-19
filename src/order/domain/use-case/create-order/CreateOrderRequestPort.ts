import { UniqueEntityID } from '../../../../common/domain/UniqueEntityId';
import { Item } from '../../entity/Item';

export interface CreateOrderRequestPort {
  customerId: UniqueEntityID;
  originCountry: string;
  items: Item[];
}
