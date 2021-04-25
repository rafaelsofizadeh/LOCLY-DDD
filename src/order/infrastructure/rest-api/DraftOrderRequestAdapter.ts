import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsISO31661Alpha3,
  IsPositive,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

import { IsUUID, UUID } from '../../../common/domain';
import { Country } from '../../domain/data/Country';
import { Category, Gram } from '../../domain/entity/Item';
import { DraftOrderRequest } from '../../domain/use-case/DraftOrderUseCase';

export class ItemValidationSchema {
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
  weight: Gram;

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

export class AddressValidationSchema {
  @IsISO31661Alpha3()
  country: Country;
}

export class DraftOrderRequestAdapter implements DraftOrderRequest {
  @IsUUID()
  readonly customerId: UUID;

  @IsISO31661Alpha3()
  readonly originCountry: Country;

  @ValidateNested()
  @Type(() => AddressValidationSchema)
  readonly destination: AddressValidationSchema;

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => ItemValidationSchema)
  readonly items: ItemValidationSchema[];
}
