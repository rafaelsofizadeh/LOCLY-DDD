import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsISO31661Alpha3,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { EntityId } from '../../../common/domain/EntityId';
import { TransformStringToEntityId } from '../../../common/utils';
import { Country } from '../../domain/data/Country';
import { Address } from '../../domain/entity/Address';
import { Category, Item } from '../../domain/entity/Item';
import { Gram, PhysicalItem } from '../../domain/entity/PhysicalItem';
import { UserEditOrderRequest } from '../../domain/use-case/EditOrderUseCase';
import { HostEditOrderRequest } from '../../domain/use-case/VerifyByHostOrderUseCase';

// TODO(NOW): Remove huge redundancy with PhysicalItem and Item and between Edit... classes.
// Maybe dynamically add @IsOptional() decorator?
// TODO(NOW): class-validator (ValidationPipe) setting to remove undefined properties
class EditPhysicalItem extends PhysicalItem {
  @ValidateNested()
  @Type(() => EntityId)
  @TransformStringToEntityId()
  readonly id: EntityId;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly weight: Gram;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly width: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly length: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly height: number;
}

class EditItem extends Item {
  @ValidateNested()
  @Type(() => EntityId)
  @TransformStringToEntityId()
  readonly id: EntityId;

  @IsOptional()
  @IsString()
  @Length(5, 280)
  readonly title: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  readonly storeName: string;

  @IsOptional()
  @IsEnum(Category)
  readonly category: Category;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly weight: Gram;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly width: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly length: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly height: number;
}

export class UserEditOrderRequestAdapter implements UserEditOrderRequest {
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
  readonly orderId: EntityId;

  @IsOptional()
  @IsISO31661Alpha3()
  readonly originCountry?: Country;

  @IsOptional()
  @ValidateNested()
  @Type(() => Address)
  readonly destination?: Address;

  @IsOptional()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => EditItem)
  readonly items?: EditItem[];
}

export class HostEditOrderRequestAdapter implements HostEditOrderRequest {
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
  orderId: EntityId;

  // TODO(VERY IMPORTANT): Host should only update items' physical characteristics
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => EditPhysicalItem)
  physicalItems: EditPhysicalItem[];
}
