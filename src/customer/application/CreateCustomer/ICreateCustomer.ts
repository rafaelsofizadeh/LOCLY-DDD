import { IsEmail, IsOptional } from 'class-validator';
import { UseCase } from '../../../common/application';
import { Email } from '../../../common/domain';
import { Customer } from '../../entity/Customer';

export interface CreateCustomerRequest {
  readonly email: Email;
}

export class CreateCustomerRequest implements CreateCustomerRequest {
  @IsOptional()
  @IsEmail()
  readonly email: Email;
}

export abstract class ICreateCustomer extends UseCase<
  CreateCustomerRequest,
  Customer
> {}
