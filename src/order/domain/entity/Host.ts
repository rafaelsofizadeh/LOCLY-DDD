import { IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { EntityProps } from '../../../common/domain/Entity';
import { EntityId } from '../../../common/domain/EntityId';
import { EntityIdsToStringIds } from '../../../common/types';
import { Serializable } from '../../../common/domain/Serializable';

import { Address, AddressProps } from './Address';
import { TransformEntityIdArrayToStringArray } from '../../../common/utils';
import { ConfirmedOrder } from './ConfirmedOrder';

export class HostProps extends EntityProps {
  @ValidateNested()
  @Type(() => Address)
  address: Address;

  @IsBoolean()
  available: boolean;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => EntityId)
  @TransformEntityIdArrayToStringArray()
  orderIds: EntityId[];
}

export type HostPropsPlain = Omit<
  EntityIdsToStringIds<Required<HostProps>>,
  'address' | 'orderIds'
> & {
  address: AddressProps;
  orderIds: string[];
};

export class Host extends Serializable<HostPropsPlain, typeof HostProps>(
  HostProps,
) {
  constructor(
    {
      id = new EntityId(),
      address,
      orderIds,
      available,
    }: HostProps = new HostProps(), // default value is needed for class-validator plainToClass. Refer to: Order.ts
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
