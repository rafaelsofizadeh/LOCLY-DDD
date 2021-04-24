import { ClientSession } from 'mongodb';
import { UUID } from '../../../common/domain/UUID';
import { Customer } from '../../domain/entity/Customer';
import { DraftedOrder } from '../../domain/entity/DraftedOrder';

export abstract class CustomerRepository {
  abstract addCustomer(
    customer: Customer,
    transaction?: ClientSession,
  ): Promise<void>;

  abstract deleteCustomer(
    customerId: UUID,
    transaction?: ClientSession,
  ): Promise<void>;

  abstract addOrderToCustomer(
    customerId: UUID,
    orderId: UUID,
    transaction?: ClientSession,
  ): Promise<void>;

  abstract removeOrderFromCustomer(
    customerId: UUID,
    orderId: UUID,
    transaction?: ClientSession,
  ): Promise<void>;

  abstract findCustomer(
    customerId: UUID,
    transaction?: ClientSession,
  ): Promise<Customer>; // throws new Exception(Code.ENTITY_NOT_FOUND_ERROR, 'Customer not found.')
}
