import { ClientSession } from 'mongodb';
import { UUID } from '../../../common/domain';
import { Customer } from '../../domain/entity/Customer';

export abstract class CustomerRepository {
  abstract addCustomer(
    customer: Customer,
    session?: ClientSession,
  ): Promise<void>;

  abstract deleteCustomer(
    customerId: UUID,
    session?: ClientSession,
  ): Promise<void>;

  abstract addOrderToCustomer(
    customerId: UUID,
    orderId: UUID,
    session?: ClientSession,
  ): Promise<void>;

  abstract removeOrderFromCustomer(
    customerId: UUID,
    orderId: UUID,
    session?: ClientSession,
  ): Promise<void>;

  abstract findCustomer(
    customerId: UUID,
    session?: ClientSession,
  ): Promise<Customer>; // throws new Exception(Code.ENTITY_NOT_FOUND_ERROR, 'Customer not found.')
}
