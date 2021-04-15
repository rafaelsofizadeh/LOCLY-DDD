import { Type } from 'class-transformer';
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
  /*
   * Nest.js first performs transformation, then validation, so, the process is like:
   * HTTP request -> customerId: "string" ->
   * class-transformer Transform() -> UUID ->
   * class-validator Validate()
   * https://github.com/nestjs/nest/blob/fa494041c8705dc0600ddf623fb5e1e676932221/packages/common/pipes/validation.pipe.ts#L96
   */
  @IsUUID()
  readonly customerId: UUID;

  @IsISO31661Alpha3()
  readonly originCountry: Country;

  @ValidateNested()
  @Type(() => Address)
  readonly destination: Address;

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => Item)
  readonly items: Item[];
}
