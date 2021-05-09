import { Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  IsPositive,
  IsUrl,
  Equals,
  IsDefined,
  IsNotEmptyObject,
  ValidateNested,
} from 'class-validator';
import { UseCase } from '../../../common/application';
import { IsUUID, UUID } from '../../../common/domain';
import { Gram } from '../../entity/Item';
import { Cost as ICost } from '../../entity/Order';

export type URL = string;

export interface SubmitShipmentInfoRequest {
  readonly orderId: UUID;
  readonly hostId: UUID;
  readonly totalWeight: Gram;
  readonly shipmentCost: Cost;
  readonly calculatorResultUrl?: URL;
}

class Cost implements ICost {
  @IsInt()
  @IsPositive()
  amount: number;

  // @IsIn(Currency)
  @Equals('USD')
  currency: 'USD';
}

export class SubmitShipmentInfoRequest implements SubmitShipmentInfoRequest {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly hostId: UUID;

  @IsInt()
  @IsPositive()
  readonly totalWeight: Gram;

  @ValidateNested()
  @IsNotEmptyObject()
  @IsDefined()
  @Type(() => Cost)
  readonly shipmentCost: Cost;

  @IsOptional()
  @IsUrl()
  readonly calculatorResultUrl?: URL;
}

export type SubmitShipmentInfoResult = void;

export abstract class ISubmitShipmentInfo extends UseCase<
  SubmitShipmentInfoRequest,
  SubmitShipmentInfoResult
> {}
