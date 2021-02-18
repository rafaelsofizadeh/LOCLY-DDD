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
  constructor({
    id = new EntityId(),
    selectedAddress,
    orderIds,
  }: CustomerProps) {
    super();

    this.id = id;
    this.selectedAddress = selectedAddress;
    this.orderIds = orderIds;
  }

  async acceptOrder(
    order: Order,
    persistAddOrderToCustomer: (
      customer: Customer,
      order: Order,
    ) => Promise<void>,
  ) {
    await persistAddOrderToCustomer(this, order).catch(error => {
      throw new Exception(
        Code.INTERNAL_ERROR,
        `Customer couldn't accept order and add order to consumer (orderId: ${order.id}, customerId: ${this.id}): ${error}`,
        { order, customer: this },
      );
    });

    this.orderIds.push(order.id);
  }
}
