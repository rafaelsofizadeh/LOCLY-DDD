import { IsEmail, IsOptional } from 'class-validator';
import { UseCase } from '../../../common/application';
import { Email, IsUUID, UUID } from '../../../common/domain';
import { Customer } from '../../entity/Customer';

export interface GetCustomerPayload {
  readonly customerId?: UUID;
  readonly email?: Email;
}

export class GetCustomerRequest implements GetCustomerPayload {
  @IsOptional()
  @IsEmail()
  readonly email?: Email;

  @IsOptional()
  @IsUUID()
  readonly customerId?: UUID;
}

export abstract class IGetCustomer extends UseCase<
  GetCustomerPayload,
  Customer
> {}
