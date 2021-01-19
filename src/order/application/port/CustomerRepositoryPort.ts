import { UniqueEntityID } from '../../../common/domain/UniqueEntityId';
import { Optional } from '../../../common/types';
import { Customer } from '../../domain/entity/Customer';

export interface CustomerRepositoryPort {
  findCustomer(customerId: UniqueEntityID): Promise<Optional<Customer>>; // throws new Exception(Code.ENTITY_NOT_FOUND_ERROR, 'Customer not found.')
}
