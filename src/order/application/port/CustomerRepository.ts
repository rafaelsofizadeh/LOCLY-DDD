import { ClientSession } from 'mongodb';
import { EntityId } from '../../../common/domain/EntityId';
import { Optional } from '../../../common/types';
import { Customer } from '../../domain/entity/Customer';
import { DraftedOrder } from '../../domain/entity/DraftedOrder';
import { Order } from '../../domain/entity/Order';

export abstract class CustomerRepository {
  abstract addCustomer(
    customer: Customer,
    transaction?: ClientSession,
  ): Promise<void>;

  abstract deleteCustomer(
    customerId: EntityId,
    transaction?: ClientSession,
  ): Promise<void>;

  // This should always be used together with OrderRepository.addCustomerToOrder
  abstract addOrderToCustomer(
    customer: Customer,
    order: DraftedOrder,
    transaction?: ClientSession,
  ): Promise<void>;

  abstract findCustomer(
    customerId: EntityId,
    transaction?: ClientSession,
  ): Promise<Optional<Customer>>; // throws new Exception(Code.ENTITY_NOT_FOUND_ERROR, 'Customer not found.')
}
