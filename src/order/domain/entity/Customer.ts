import { IsArray, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

import { Exception } from '../../../common/error-handling/Exception';
import { EntityProps } from '../../../common/domain/Entity';
import { EntityId } from '../../../common/domain/EntityId';
import { EntityIdToStringId } from '../../../common/types';
import { Serializable } from '../../../common/domain/Serializable';
import { Identifiable } from '../../../common/domain/Identifiable';

import { Address, AddressProps } from './Address';
import { Order } from './Order';
import { Code } from '../../../common/error-handling/Code';
import { TransformEntityIdArrayToStringArray } from '../../../common/utils';

export class CustomerProps extends EntityProps {
  @ValidateNested()
  @Type(() => Address)
  selectedAddress: Address;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => EntityId)
  @TransformEntityIdArrayToStringArray()
  orderIds: EntityId[];
}

export type CustomerPropsPlain = Omit<
  EntityIdToStringId<Required<CustomerProps>>,
  'selectedAddress' | 'orderIds'
> & {
  selectedAddress: AddressProps;
  orderIds: string[];
};

export class Customer extends Identifiable(
  Serializable<CustomerPropsPlain, typeof CustomerProps>(CustomerProps),
) {
  constructor(
    {
      id = new EntityId(),
      selectedAddress,
      orderIds,
    }: CustomerProps = new CustomerProps(), // default value is needed for class-validator plainToClass. Refer to: Order.ts
  ) {
    super();

    this.id = id;
    this.selectedAddress = selectedAddress;
    this.orderIds = orderIds;
  }

  acceptOrder(order: Order) {
    this.orderIds.push(order.id);
  }
}
