import { ValidateNested } from 'class-validator';
import { Address } from './Address';
import { EntityProps } from '../../../common/domain/Entity';
import { Type } from 'class-transformer';
import { EntityId } from '../../../common/domain/EntityId';

export class CustomerProps extends EntityProps {
  @ValidateNested()
  @Type(() => Address)
  selectedAddress: Address;
}

export class Customer extends CustomerProps {
  constructor(
    {
      id = new EntityId(),
      selectedAddress,
    }: CustomerProps = new CustomerProps(),
  ) {
    super();

    this.id = id;
    this.selectedAddress = selectedAddress;
  }
}
