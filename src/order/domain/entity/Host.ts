import { IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

import { EntityProps } from '../../../common/domain/Entity';
import { EntityId } from '../../../common/domain/EntityId';
import { EntityIdToStringId } from '../../../common/types';
import { Serializable } from '../../../common/domain/Serializable';
import { Identifiable } from '../../../common/domain/Identifiable';

import { Address, AddressProps } from './Address';
import { Order } from './Order';
import { Exception } from '../../../common/error-handling/Exception';
import { Code } from '../../../common/error-handling/Code';
import { TransformEntityIdArrayToStringArray } from '../../../common/utils';

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
  EntityIdToStringId<Required<HostProps>>,
  'address' | 'orderIds'
> & {
  address: AddressProps;
  orderIds: string[];
};

export class Host extends Identifiable(
  Serializable<HostPropsPlain, typeof HostProps>(HostProps),
) {
  constructor({
    id = new EntityId(),
    address,
    orderIds,
    available,
  }: HostProps) {
    super();

    this.id = id;
    this.address = address;
    this.orderIds = orderIds;
    this.available = available;
  }

  async acceptOrder(
    order: Order,
    persistAddOrderToHost: (host: Host, order: Order) => Promise<void>,
  ) {
    await persistAddOrderToHost(this, order).catch(error => {
      throw new Exception(
        Code.INTERNAL_ERROR,
        `Host couldn't accept order and add order to host (orderId: ${order.id}, hostId: ${this.id}): ${error}`,
        { order, host: this },
      );
    });

    this.orderIds.push(order.id);
  }
}
