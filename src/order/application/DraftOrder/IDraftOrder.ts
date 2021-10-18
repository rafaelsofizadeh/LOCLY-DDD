import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsInt,
  IsISO31661Alpha3,
  IsNotEmptyObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Length,
  ValidateNested,
} from 'class-validator';

import { Country } from '../../entity/Country';
import { Gram } from '../../entity/Item';
import { UseCase } from '../../../common/application';
import {
  Address,
  AddressValidationSchema,
  UUID,
  WithoutId,
} from '../../../common/domain';
import { DraftedItem } from '../../entity/Item';
import { DraftedOrder } from '../../entity/Order';
import { UnidCustomerRequest } from '../../../customer/entity/Customer';

interface DraftItemRequest extends WithoutId<DraftedItem> {}

export interface DraftOrderPayload
  extends Pick<DraftedOrder, 'customerId' | 'originCountry' | 'destination'> {
  readonly orderId?: UUID;
  readonly items: DraftItemRequest[];
}

class DraftItemRequestSchema implements DraftItemRequest {
  @IsString()
  @Length(5, 280)
  title: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsInt()
  @IsPositive()
  weight: Gram;
}

export class DraftOrderRequest
  implements Omit<UnidCustomerRequest<DraftOrderPayload>, 'orderId'> {
  @IsISO31661Alpha3()
  readonly originCountry: Country;

  @ValidateNested()
  @IsNotEmptyObject()
  @IsDefined()
  @Type(() => AddressValidationSchema)
  readonly destination: Address;

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => DraftItemRequestSchema)
  readonly items: DraftItemRequestSchema[];
}

export abstract class IDraftOrder extends UseCase<
  DraftOrderPayload,
  DraftedOrder
> {}
