import { Type } from 'class-transformer';
import { IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { UseCase } from '../../../common/application';
import { Address, AddressValidationSchema, UUID } from '../../../common/domain';
import { UnidCustomerRequest } from '../../entity/Customer';

export type EditCustomerPayload = {
  customerId: UUID;
  firstName?: string;
  lastName?: string;
  addresses?: Address[];
};

export class EditCustomerRequest
  implements UnidCustomerRequest<EditCustomerPayload> {
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

export abstract class IEditCustomer extends UseCase<
  EditCustomerPayload,
  void
> {}
