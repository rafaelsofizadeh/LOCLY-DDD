import { ClientSession } from 'mongodb';
import { UUID } from '../../common/domain';
import { Customer, CustomerFilter } from '../entity/Customer';

export type AllowedCustomerProperties = Omit<CustomerFilter, 'customerId'>;

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

  abstract setProperties(
    filter: CustomerFilter,
    properties: AllowedCustomerProperties,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract findCustomer(
    filter: CustomerFilter,
    mongoTransactionSession?: ClientSession,
    throwIfNotFound?: boolean,
  ): Promise<Customer>; // throws new Exception(Code.ENTITY_NOT_FOUND_ERROR, 'Customer not found.')
}
