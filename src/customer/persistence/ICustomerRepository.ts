import { ClientSession } from 'mongodb';
import { UUID } from '../../common/domain';
import { Customer } from '../../order/entity/Customer';

export abstract class ICustomerRepository {
  abstract addCustomer(
    customer: Customer,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract deleteCustomer(
    customerId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract addOrderToCustomer(
    customerId: UUID,
    orderId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract removeOrderFromCustomer(
    customerId: UUID,
    orderId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract findCustomer(
    customerId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<Customer>; // throws new Exception(Code.ENTITY_NOT_FOUND_ERROR, 'Customer not found.')
}
