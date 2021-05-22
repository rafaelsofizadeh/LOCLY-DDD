import {
  IsISO31661Alpha3,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { UseCase } from '../../../../common/application';
import { UUID } from '../../../../common/domain';
import { Country } from '../../../../order/entity/Country';
import {
  Address,
  UnidCustomerOrderRequest,
} from '../../../../order/entity/Order';

export interface AddAddressRequest extends Address {
  customerId: UUID;
}

export class AddAddressRequest implements UnidCustomerOrderRequest<Address> {
  @IsString()
  @Length(1, 256)
  addressLine1: string;

  @IsOptional()
  @IsString()
  @Length(1, 256)
  addressLine2?: string;

  @IsString()
  @Length(1, 256)
  locality: string;

  @IsString()
  @Length(1, 256)
  administrativeArea?: string;

  @IsISO31661Alpha3()
  country: Country;

  @IsOptional()
  @IsString()
  @Length(1, 32)
  postalCode: string;
}

export abstract class IAddAddress extends UseCase<AddAddressRequest, void> {}
