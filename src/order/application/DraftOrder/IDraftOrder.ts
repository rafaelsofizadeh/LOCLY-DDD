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
import { UseCase } from '../../../common/application';
import { WithoutId } from '../../../common/domain';
import { DraftedItem } from '../../entity/Item';
import { DraftedOrder } from '../../entity/Order';

export interface DraftItemRequest extends WithoutId<DraftedItem> {}

export interface DraftOrderRequest
  extends Pick<DraftedOrder, 'customerId' | 'originCountry' | 'destination'> {
  readonly items: DraftItemRequest[];
}

export class DraftItemRequest implements DraftItemRequest {
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

export class DraftOrderRequest implements DraftOrderRequest {
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
  @Type(() => DraftItemRequest)
  readonly items: DraftItemRequest[];
}

export abstract class DraftOrderUseCase extends UseCase<
  DraftOrderRequest,
  DraftedOrder
> {}
