import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsInt,
  IsISO31661Alpha3,
  IsNotEmptyObject,
  IsPositive,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

import { IsUUID, UUID } from '../../../common/domain';
import { Country } from '../../entity/Country';
import { Gram } from '../../entity/Item';
import { DraftOrderRequest } from './DraftOrderUseCase';

export class ItemValidationSchema {
  @IsString()
  @Length(5, 280)
  title: string;

  @IsString()
  @Length(2, 50)
  storeName: string;

  @IsInt()
  @IsPositive()
  weight: Gram;
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
  @IsNotEmptyObject()
  @IsDefined()
  @Type(() => AddressValidationSchema)
  readonly destination: AddressValidationSchema;

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => ItemValidationSchema)
  readonly items: ItemValidationSchema[];
}
