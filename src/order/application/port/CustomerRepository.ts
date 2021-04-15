import { ClientSession } from 'mongodb';
import { UUID } from '../../../common/domain/UUID';
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
    customerId: UUID,
    transaction?: ClientSession,
  ): Promise<void>;

  // This should always be used together with OrderRepository.addCustomerToOrder
  abstract addOrderToCustomer(
    draftedOrder: DraftedOrder,
    transaction?: ClientSession,
  ): Promise<void>;

  abstract findCustomer(
    customerId: UUID,
    transaction?: ClientSession,
  ): Promise<Optional<Customer>>; // throws new Exception(Code.ENTITY_NOT_FOUND_ERROR, 'Customer not found.')
}
