import { IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { IsUUID, UUID } from '../../../common/domain/UUID';
import { Serializable } from '../../../common/domain/Serializable';

import { Address, AddressProps } from './Address';
import { ConfirmedOrder } from './ConfirmedOrder';

export class HostProps {
  // TODO: Optional id?
  @IsUUID()
  id?: UUID;

  @ValidateNested()
  @Type(() => Address)
  address: Address;

  @IsBoolean()
  available: boolean;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => UUID)
  orderIds: UUID[];
}

export type HostPropsPlain = Omit<
  Required<HostProps>,
  'address' | 'orderIds'
> & {
  address: AddressProps;
  orderIds: string[];
};

export class Host extends Serializable<HostPropsPlain, typeof HostProps>(
  HostProps,
) {
  constructor(
    { id = UUID(), address, orderIds, available }: HostProps = new HostProps(), // default value is needed for class-validator plainToClass. Refer to: Order.ts
  ) {
    super();

    this.id = id;
    this.address = address;
    this.orderIds = orderIds;
    this.available = available;
  }

  async acceptOrder({ id: orderId }: ConfirmedOrder) {
    this.orderIds.push(orderId);
  }
}
