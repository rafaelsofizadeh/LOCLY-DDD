import { ClientSession } from 'mongodb';
import { UUID } from '../../common/domain';
import { Customer, CustomerFilter } from '../entity/Customer';

export abstract class ICustomerRepository {
  abstract addCustomer(
    customer: Customer,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract deleteCustomer(
    filter: CustomerFilter,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract addOrderToCustomer(
    filter: CustomerFilter,
    orderId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract removeOrderFromCustomer(
    filter: CustomerFilter,
    orderId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract findCustomer(
    filter: CustomerFilter,
    mongoTransactionSession?: ClientSession,
  ): Promise<Customer>; // throws new Exception(Code.ENTITY_NOT_FOUND_ERROR, 'Customer not found.')
}
