import { WithoutId } from '../../../common/domain';
import { UUID } from '../../../common/domain';

export type Gram = number;

export type PhysicalItemProps = {
  weight: Gram;
};

export interface ItemProps extends PhysicalItemProps {
  id: UUID;
  title: string;
  storeName: string;
}

// TODO: Remove physical dimensions
export class Item implements ItemProps {
  readonly id: UUID;

  readonly title: string;

  readonly storeName: string;

  readonly weight: Gram;

  private constructor({ id, title, storeName, weight }: ItemProps) {
    this.id = id;
    this.title = title;
    this.storeName = storeName;
    this.weight = weight;
  }

  static fromData(payload: ItemProps) {
    return new this(payload);
  }

  static create(payload: WithoutId<ItemProps>) {
    return new this({ ...payload, id: UUID() });
  }
}
