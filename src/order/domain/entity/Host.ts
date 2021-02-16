import { IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Address, AddressProps } from './Address';
import { EntityProps } from '../../../common/domain/Entity';
import { Type } from 'class-transformer';
import { EntityId } from '../../../common/domain/EntityId';
import { Order, OrderPropsPlain } from './Order';
import { EntityIdToStringId } from '../../../common/types';
import { Serializable } from '../../../common/domain/Serializable';
import { Identifiable } from '../../../common/domain/Identifiable';

export class HostProps extends EntityProps {
  @ValidateNested()
  @Type(() => Address)
  address: Address;

  @IsBoolean()
  available: boolean;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => Order)
  orders: Order[];
}

export type HostPropsPlain = Omit<
  EntityIdToStringId<Required<HostProps>>,
  'address' | 'orders'
> & { address: AddressProps; orders: OrderPropsPlain[] };

export class Host extends Identifiable(
  Serializable<HostPropsPlain, typeof HostProps>(HostProps),
) {
  constructor(
    {
      id = new EntityId(),
      address,
      orders,
      available,
    }: HostProps = new HostProps(),
  ) {
    super();

    this.id = id;
    this.address = address;
    this.orders = orders;
    this.available = available;
  }
}
