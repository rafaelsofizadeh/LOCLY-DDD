import { EntityId } from '../../../common/domain/EntityId';
import { Country } from '../data/Country';
import { Item } from '../entity/Item';
import { DraftedOrder } from '../entity/DraftedOrder';
import { Address } from '../entity/Address';

export interface UserEditOrderRequest {
  orderId: EntityId;
  originCountry?: Country;
  destination?: Address;
  items?: Item[];
}

export abstract class EditOrderUseCase {
  abstract execute(port: UserEditOrderRequest): Promise<DraftedOrder>;
}
