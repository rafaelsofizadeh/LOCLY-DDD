import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { IsUUID, UUID } from '../../../common/domain/UUID';
import { Serializable } from '../../../common/domain/Serializable';

import { Address, AddressProps } from './Address';
import { DraftedOrder } from './DraftedOrder';

export class CustomerProps {
  @IsUUID()
  id?: UUID;

  @ValidateNested()
  @Type(() => Address)
  selectedAddress: Address;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => UUID)
  orderIds: UUID[];
}

export type CustomerPropsPlain = Omit<
  Required<CustomerProps>,
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
      id = UUID(),
      selectedAddress,
      orderIds,
    }: CustomerProps = new CustomerProps(), // default value is needed for class-validator plainToClass. Refer to: Order.ts
  ) {
    super();

    this.id = id;
    this.selectedAddress = selectedAddress;
    this.orderIds = orderIds;
  }

  acceptOrder({ id: orderId }: DraftedOrder) {
    this.orderIds.push(orderId);
  }
}
