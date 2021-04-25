import { WithoutId } from '../../../common/domain';
import { UUID } from '../../../common/domain';

export type Gram = number;

export const Category = {
  Art: 'art',
  Games: 'games',
  Electronics: 'electronics',
} as const;

export type Category = typeof Category[keyof typeof Category];

export type PhysicalItemProps = {
  weight: Gram;
};

export interface ItemProps extends PhysicalItemProps {
  id: UUID;
  title: string;
  storeName: string;
  category: Category;
}

// TODO: Remove physical dimensions
export class Item implements ItemProps {
  readonly id: UUID;

  readonly title: string;

  readonly storeName: string;

  readonly category: Category;

  readonly weight: Gram;

  private constructor({ id, title, storeName, category, weight }: ItemProps) {
    this.id = id;
    this.title = title;
    this.storeName = storeName;
    this.category = category;
    this.weight = weight;
  }

  static fromData(payload: ItemProps) {
    return new this(payload);
  }

  static create(payload: WithoutId<ItemProps>) {
    return new this({ ...payload, id: UUID() });
  }
}
