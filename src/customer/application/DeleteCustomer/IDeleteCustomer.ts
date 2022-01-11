import { Customer } from '../../../customer/entity/Customer';
import { UseCase } from '../../../common/application';

export type DeleteCustomerPayload = Readonly<{
  customerId: Customer['id'];
}>;

export type DeleteCustomerResult = void;

export abstract class IDeleteCustomer extends UseCase<
  DeleteCustomerPayload,
  DeleteCustomerResult
> {}
