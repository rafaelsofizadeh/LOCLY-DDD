import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsISO31661Alpha3,
  ValidateNested,
} from 'class-validator';

import { EntityId } from '../../../common/domain/EntityId';
import { TransformStringToEntityId } from '../../../common/utils';
import { Country } from '../../domain/data/Country';
import { Item } from '../../domain/entity/Item';
import { CreateOrderRequest } from '../../domain/use-case/CreateOrderUseCase';

export class CreateOrderRequestAdapter implements CreateOrderRequest {
  /*
   * Nest.js first performs transformation, then validation, so, the process is like:
   * HTTP request -> customerId: "string" ->
   * class-transformer Transform() -> EntityId ->
   * class-validator Validate()
   * https://github.com/nestjs/nest/blob/fa494041c8705dc0600ddf623fb5e1e676932221/packages/common/pipes/validation.pipe.ts#L96
   */
  @ValidateNested()
  @Type(() => EntityId)
  @TransformStringToEntityId()
  readonly customerId: EntityId;

  @IsISO31661Alpha3()
  readonly originCountry: Country;

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => Item)
  readonly items: Item[];
}
