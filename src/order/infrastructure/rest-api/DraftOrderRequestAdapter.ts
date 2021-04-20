import {
  ArrayMinSize,
  IsArray,
  IsISO31661Alpha3,
  ValidateNested,
} from 'class-validator';

import { IsUUID, UUID } from '../../../common/domain/UUID';
import { Country } from '../../domain/data/Country';
import { Address } from '../../domain/entity/Address';
import { Item } from '../../domain/entity/Item';
import { DraftOrderRequest } from '../../domain/use-case/DraftOrderUseCase';

export class DraftOrderRequestAdapter implements DraftOrderRequest {
  @IsUUID()
  readonly customerId: UUID;

  @IsISO31661Alpha3()
  readonly originCountry: Country;

  @ValidateNested()
  readonly destination: Address;

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  readonly items: Item[];
}
