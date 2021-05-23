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
import { UnidHostRequest } from '../../../host/entity/Host';

export type URL = string;

export interface SubmitShipmentInfoPayload
  extends Readonly<{
    orderId: UUID;
    hostId: UUID;
    totalWeight: Gram;
    shipmentCost: Cost;
    calculatorResultUrl?: URL;
  }> {}

class Cost implements ICost {
  @IsInt()
  @IsPositive()
  amount: number;

  // @IsIn(Currency)
  @Equals('USD')
  currency: 'USD';
}

export class SubmitShipmentInfoRequest
  implements UnidHostRequest<SubmitShipmentInfoPayload> {
  @IsUUID()
  readonly orderId: UUID;

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
  SubmitShipmentInfoPayload,
  SubmitShipmentInfoResult
> {}
