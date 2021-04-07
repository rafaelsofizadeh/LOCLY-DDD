import { IsString, Length, IsEnum } from 'class-validator';
import { EntityId } from '../../../common/domain/EntityId';
import { EntityIdsToStringIds } from '../../../common/types';
import {
  PackagePhysicalCharacteristics,
  PhysicalItemProps,
} from './PhysicalItem';

export const Category = {
  Art: 'art',
  Games: 'games',
  Electronics: 'electronics',
} as const;

export type Category = typeof Category[keyof typeof Category];

export class ItemProps extends PhysicalItemProps {
  @IsString()
  @Length(5, 280)
  title: string;

  @IsString()
  @Length(2, 50)
  storeName: string;

  @IsEnum(Category)
  category: Category;
}

export type ItemPropsPlain = EntityIdsToStringIds<ItemProps>;

export class Item extends ItemProps {
  constructor(
    {
      id = new EntityId(),
      title,
      storeName,
      category,
      weight,
      width,
      length,
      height,
    }: ItemProps = new ItemProps(), // default value is needed for class-validator plainToClass. Refer to: Order.ts
  ) {
    super();

    this.id = id;
    this.title = title;
    this.storeName = storeName;
    this.category = category;
    this.weight = weight;
    this.width = width;
    this.length = length;
    this.height = height;
  }

  get physicalCharacteristics(): PackagePhysicalCharacteristics {
    return {
      width: this.width,
      length: this.length,
      height: this.height,
      weight: this.weight,
    };
  }

  serialize(): ItemPropsPlain {
    return {
      id: this.id?.value,
      title: this.title,
      storeName: this.storeName,
      category: this.category,
      weight: this.weight,
      width: this.width,
      length: this.length,
      height: this.height,
    };
  }
}
