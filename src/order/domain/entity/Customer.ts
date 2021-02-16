import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { Address, AddressProps } from './Address';
import { EntityProps } from '../../../common/domain/Entity';
import { EntityId } from '../../../common/domain/EntityId';
import { Order, OrderPropsPlain } from './Order';
import { EntityIdToStringId } from '../../../common/types';
import { Serializable } from '../../../common/domain/Serializable';
import { Identifiable } from '../../../common/domain/Identifiable';

export class CustomerProps extends EntityProps {
  @ValidateNested()
  @Type(() => Address)
  selectedAddress: Address;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => Order)
  orders: Order[];
}

export type CustomerPropsPlain = Omit<
  EntityIdToStringId<Required<CustomerProps>>,
  'selectedAddress' | 'orders'
> & {
  selectedAddress: AddressProps;
  orders: OrderPropsPlain[];
};

export class Customer extends Identifiable(
  Serializable<CustomerPropsPlain, typeof CustomerProps>(CustomerProps),
) {
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
