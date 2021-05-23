import { UseCase } from '../../../common/application';
import { Email } from '../../../common/domain';
import { Customer } from '../../entity/Customer';

export interface CreateCustomerPayload {
  readonly email: Email;
}

export abstract class ICreateCustomer extends UseCase<
  CreateCustomerPayload,
  Customer
> {}
