import { EntityFilter } from '../../../common/domain';
import { UUID } from '../../../common/domain';
import { Photo } from '../../infrastructure/persistence/order/OrderMongoMapper';

export type Gram = number;

export type PhysicalItem = {
  readonly weight: Gram;
};

export interface Item extends PhysicalItem {
  readonly id: UUID;
  readonly title: string;
  readonly storeName: string;
  // TODO: Separate optional fields into separate interface
  readonly photos?: Photo[];
  readonly receivedDate?: Date;
}

export type ItemFilter = EntityFilter<Item, { itemId: UUID }>;
