import { EntityFilter, WithoutId } from '../../../common/domain';
import { UUID } from '../../../common/domain';

export type Gram = number;

export type PhysicalItemProps = {
  weight: Gram;
};

export interface ItemProps extends PhysicalItemProps {
  id: UUID;
  title: string;
  storeName: string;
  receivedDate?: Date;
}

export class Item implements ItemProps {
  readonly id: UUID;

  readonly title: string;

  readonly storeName: string;

  readonly weight: Gram;

  readonly receivedDate: Date;

  private constructor({
    id,
    title,
    storeName,
    weight,
    receivedDate,
  }: ItemProps) {
    this.id = id;
    this.title = title;
    this.storeName = storeName;
    this.weight = weight;
    this.receivedDate = receivedDate;
  }

  static fromData(payload: ItemProps) {
    return new this(payload);
  }

  static create(payload: WithoutId<ItemProps>) {
    return new this({ ...payload, id: UUID() });
  }
}

export type ItemFilter = EntityFilter<ItemProps>;
