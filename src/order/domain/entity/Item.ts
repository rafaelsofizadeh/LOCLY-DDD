import { IsEnum, IsInt, IsPositive, IsString, Length } from 'class-validator';

import { EntityProps } from '../../../common/domain/Entity';
import { EntityId } from '../../../common/domain/EntityId';
import { Identifiable } from '../../../common/domain/Identifiable';
import { Validatable } from '../../../common/domain/Validatable';

// TODO: Change enum to union
enum Category {
  Art,
  Games,
  Electronics,
}

export type PhysicalCharacteristics = {
  width: number;
  length: number;
  height: number;
  weight: number;
};

export class ItemProps extends EntityProps {
  @IsString()
  @Length(5, 280)
  title: string;

  @IsString()
  @Length(2, 50)
  storeName: string;

  @IsEnum(Category)
  category: Category;

  @IsInt()
  @IsPositive()
  weight: number;

  @IsInt()
  @IsPositive()
  width: number;

  @IsInt()
  @IsPositive()
  length: number;

  @IsInt()
  @IsPositive()
  height: number;
}

export class Item extends Identifiable(Validatable(ItemProps)) {
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
    }: ItemProps = new ItemProps(),
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

  get physicalCharacteristics(): PhysicalCharacteristics {
    return {
      width: this.width,
      length: this.length,
      height: this.height,
      weight: this.weight,
    };
  }
}
