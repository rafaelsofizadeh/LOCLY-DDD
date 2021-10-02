import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';

export interface DeleteCustomerPayload {
  customerId: UUID;
}

export type DeleteCustomerResult = void;

export abstract class IDeleteCustomer extends UseCase<
  DeleteCustomerPayload,
  DeleteCustomerResult
> {}
