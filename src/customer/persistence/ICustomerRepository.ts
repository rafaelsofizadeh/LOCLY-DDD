import { ClientSession } from 'mongodb';
import { UUID } from '../../common/domain';
import { Address } from '../../order/entity/Order';
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

  abstract addOrder(
    filter: CustomerFilter,
    orderId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract removeOrder(
    filter: CustomerFilter,
    orderId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract addAddress(
    filter: CustomerFilter,
    address: Address,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract removeAddress(
    filter: CustomerFilter,
    address: Address,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract findCustomer(
    filter: CustomerFilter,
    mongoTransactionSession?: ClientSession,
    throwIfNotFound?: boolean,
  ): Promise<Customer>; // throws new Exception(Code.ENTITY_NOT_FOUND_ERROR, 'Customer not found.')
}
