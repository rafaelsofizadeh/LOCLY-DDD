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

import { IsUUID, UUID } from '../../../../common/domain';
import { Gram } from '../../../domain/entity/Item';
import { Cost } from '../../../domain/entity/Order';
import {
  FinalizeOrderRequest,
  URL,
} from '../../../domain/use-case/FinalizeOrderUseCase';

class CostVerificationSchema implements Cost {
  @IsInt()
  @IsPositive()
  amount: number;

  // @IsIn(Currency)
  @Equals('USD')
  currency: 'USD';
}

export class FinalizeOrderRequestAdapter implements FinalizeOrderRequest {
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
  deliveryCost: CostVerificationSchema;

  @IsOptional()
  @IsUrl()
  calculatorResultUrl: URL;
}
