import { Type } from 'class-transformer';
import { IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { Address, AddressValidationSchema, UUID } from '../../../common/domain';
import { UnidCustomerOrderRequest } from '../../../order/entity/Order';

export type EditCustomerPayload = {
  customerId: UUID;
  firstName?: string;
  lastName?: string;
  addresses?: Address[];
};

export class EditCustomerRequest
  implements UnidCustomerOrderRequest<EditCustomerPayload> {
  @IsOptional()
  @IsString()
  @Length(1, 32)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 32)
  lastName?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AddressValidationSchema)
  addresses: Address[];
}
