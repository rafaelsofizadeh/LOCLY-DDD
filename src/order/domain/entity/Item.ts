import { EntityFilter } from '../../../common/domain';
import { UUID } from '../../../common/domain';

export type Gram = number;

export type PhysicalItem = {
  readonly weight: Gram;
};

export interface Item extends PhysicalItem {
  readonly id: UUID;
  readonly title: string;
  readonly storeName: string;
  readonly receivedDate?: Date;
}

export type ItemFilter = EntityFilter<Item, { itemId: UUID }>;
