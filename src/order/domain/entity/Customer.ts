import { ValidateNested } from 'class-validator';
import { Address } from './Address';
import { Entity } from '../../../common/domain/Entity';

export type CustomerProps = {
  selectedAddress: Address;
};

export class Customer extends Entity<CustomerProps> {
  @ValidateNested()
  get selectedAddress(): Address {
    return this.props?.selectedAddress;
  }
}
