import { WithoutId } from '../../../common/domain/types';
import { UUID } from '../../../common/domain/UUID';

export type Gram = number;

// TODO(GLOBAL): Replace ___Props interfaces with plain ___

export const Category = {
  Art: 'art',
  Games: 'games',
  Electronics: 'electronics',
} as const;

export type Category = typeof Category[keyof typeof Category];

export type PhysicalItemProps = {
  width: number;
  length: number;
  height: number;
  weight: Gram;
};

export interface ItemProps extends PhysicalItemProps {
  id: UUID;
  title: string;
  storeName: string;
  category: Category;
}

export class Item implements ItemProps {
  readonly id: UUID;

  readonly title: string;

  readonly storeName: string;

  readonly category: Category;

  readonly width: number;

  readonly length: number;

  readonly height: number;

  readonly weight: Gram;

  private constructor({
    id,
    title,
    storeName,
    category,
    weight,
    width,
    length,
    height,
  }: ItemProps) {
    this.id = id;
    this.title = title;
    this.storeName = storeName;
    this.category = category;
    this.weight = weight;
    this.width = width;
    this.length = length;
    this.height = height;
  }

  static fromData(payload: ItemProps) {
    return new this(payload);
  }

  static create(payload: WithoutId<ItemProps>) {
    return new this({ ...payload, id: UUID() });
  }

  get physicalCharacteristics(): PhysicalItemProps {
    return {
      width: this.width,
      length: this.length,
      height: this.height,
      weight: this.weight,
    };
  }
}
