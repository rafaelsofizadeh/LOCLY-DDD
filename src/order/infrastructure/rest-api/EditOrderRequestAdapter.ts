import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsISO31661Alpha3,
  ValidateNested,
} from 'class-validator';

import { IsUUID, UUID } from '../../../common/domain';
import { Country } from '../../domain/data/Country';
import { EditOrderRequest } from '../../domain/use-case/EditOrderUseCase';
import {
  AddressValidationSchema,
  ItemValidationSchema,
} from './DraftOrderRequestAdapter';

export class EditOrderRequestAdapter implements EditOrderRequest {
  @IsUUID()
  readonly orderId: UUID;

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
