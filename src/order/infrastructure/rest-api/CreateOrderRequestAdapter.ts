import { Transform, Type } from 'class-transformer';
import {
  Allow,
  ArrayMinSize,
  IsArray,
  IsISO31661Alpha3,
  ValidateNested,
} from 'class-validator';

import {
  IsUniqueEntityId,
  UniqueEntityID,
} from '../../../common/domain/UniqueEntityId';
import { ValueObject } from '../../../common/domain/ValueObject';
import { Item } from '../../domain/entity/Item';

export class CreateOrderRequestAdapter extends ValueObject<
  CreateOrderRequestAdapter
> {
  // TODO: is customer.exists() an infrastructure-level validation or application-level?

  /*
   * Nest.js first performs transformation, then validation, so, the process is like:
   * HTTP request -> customerId: "string" ->
   * class-transformer Transform() -> UniqueEntityId ->
   * class-validator Validate()
   * https://github.com/nestjs/nest/blob/fa494041c8705dc0600ddf623fb5e1e676932221/packages/common/pipes/validation.pipe.ts#L96
   */
  @IsUniqueEntityId()
  @Transform(
    ({ value: customerIdRaw }: { value: string }) =>
      new UniqueEntityID(customerIdRaw),
  )
  @Type(() => UniqueEntityID)
  readonly customerId: UniqueEntityID;

  @IsISO31661Alpha3()
  readonly originCountry: string;

  @Allow()
  //@ArrayMinSize(1)
  //@IsArray()
  //@ValidateNested()
  //@Type(() => Item)
  readonly items: Item[];
}
