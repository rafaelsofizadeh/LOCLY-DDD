import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { EntityProps } from '../../../common/domain/Entity';
import { EntityId } from '../../../common/domain/EntityId';
import { Serializable } from '../../../common/domain/Serializable';

import { Address, AddressProps } from './Address';
import { TransformEntityIdArrayToStringArray } from '../../../common/utils';
import { EntityIdsToStringIds } from '../../../common/types';
import { DraftedOrder } from './DraftedOrder';

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
  EntityIdsToStringIds<Required<CustomerProps>>,
  'selectedAddress' | 'orderIds'
> & {
  selectedAddress: AddressProps;
  orderIds: string[];
};

export class Customer extends Serializable<
  CustomerPropsPlain,
  typeof CustomerProps
>(CustomerProps) {
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

  acceptOrder(order: DraftedOrder) {
    this.orderIds.push(order.id);
  }
}
