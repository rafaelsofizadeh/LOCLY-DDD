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

import { IsUUID, UUID } from '../../../common/domain';
import { Gram } from '../../entity/Item';
import { Cost } from '../../entity/Order';
import {
  SubmitShipmentInfoRequest,
  URL,
} from './SubmitShipmentInfoUseCase';

class CostVerificationSchema implements Cost {
  @IsInt()
  @IsPositive()
  amount: number;

  // @IsIn(Currency)
  @Equals('USD')
  currency: 'USD';
}

export class SubmitShipmentInfoRequestAdapter
  implements SubmitShipmentInfoRequest {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly hostId: UUID;

  @IsInt()
  @IsPositive()
  totalWeight: Gram;

  @ValidateNested()
  @IsNotEmptyObject()
  @IsDefined()
  @Type(() => CostVerificationSchema)
  shipmentCost: CostVerificationSchema;

  @IsOptional()
  @IsUrl()
  calculatorResultUrl?: URL;
}
