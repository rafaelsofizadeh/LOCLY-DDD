import { EntityId } from '../../../common/domain/EntityId';
import { Optional } from '../../../common/types';
import { Customer } from '../../domain/entity/Customer';
import { Order } from '../../domain/entity/Order';

export abstract class CustomerRepository {
  abstract addCustomer(customer: Customer): Promise<void>;

  abstract deleteCustomer(customerId: EntityId): Promise<void>;

  abstract addOrderToCustomer(customer: Customer, order: Order): Promise<void>;

  abstract findCustomer(customerId: EntityId): Promise<Optional<Customer>>; // throws new Exception(Code.ENTITY_NOT_FOUND_ERROR, 'Customer not found.')
}
