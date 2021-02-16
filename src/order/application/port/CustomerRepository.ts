import { EntityId } from '../../../common/domain/EntityId';
import { Optional } from '../../../common/types';
import { Customer } from '../../domain/entity/Customer';

export abstract class CustomerRepository {
  abstract addCustomer(customer: Customer): Promise<void>;

  abstract deleteCustomer(customer: Customer): Promise<void>;

  abstract findCustomer(customerId: EntityId): Promise<Optional<Customer>>; // throws new Exception(Code.ENTITY_NOT_FOUND_ERROR, 'Customer not found.')
}
