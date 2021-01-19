import {
  IsEnum,
  IsInt,
  IsPositive,
  IsString,
  Length,
  Max,
} from 'class-validator';

import { Entity } from '../../../common/domain/Entity';

// TODO: Change enum to union
enum Category {
  Art,
  Games,
  Electronics,
}

export type Dimensions = {
  width: number;
  length: number;
  height: number;
};

export interface ItemProps {
  title: string;
  storeName: string;
  category: Category;
  weight: number;
  width: number;
  length: number;
  height: number;
}

export class Item extends Entity<ItemProps> {
  @IsString()
  @Length(5, 280)
  get title(): string {
    return this.props?.title;
  }

  @IsString()
  @Length(2, 50)
  get storeName(): string {
    return this.props?.storeName;
  }

  @IsEnum(Category)
  get category(): Category {
    return this.props?.category;
  }

  @IsInt()
  @IsPositive()
  get weight(): number {
    return this.props?.weight;
  }

  @IsInt()
  @IsPositive()
  @Max(200)
  get width(): number {
    return this.props?.width;
  }

  @IsInt()
  @IsPositive()
  @Max(200)
  get length(): number {
    return this.props?.length;
  }

  @IsInt()
  @IsPositive()
  @Max(200)
  get height(): number {
    return this.props?.height;
  }
  /*
  get dimensions(): Dimensions {
    return {
      width: this.width,
      length: this.length,
      height: this.height,
    };
  }

  set dimensions({ width, length, height }: Dimensions) {
    this.props.width = width ?? this.props?.width;
    this.props.length = length ?? this.props?.length;
    this.props.height = height ?? this.props?.height;
  }
  */
}
