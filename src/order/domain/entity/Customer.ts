import { UUID } from '../../../common/domain/UUID';

import { Address, AddressProps } from './Address';
import { DraftedOrder } from './DraftedOrder';

export interface CustomerProps {
  id: UUID;
  selectedAddress: Address;
  orderIds: UUID[];
}

export type CustomerPropsPlain = Omit<CustomerProps, 'selectedAddress'> & {
  selectedAddress: AddressProps;
};

export class Customer implements CustomerProps {
  readonly id: UUID;

  readonly selectedAddress: Address;

  readonly orderIds: UUID[];

  private constructor({ id, selectedAddress, orderIds }: CustomerProps) {
    this.id = id;
    this.selectedAddress = selectedAddress;
    this.orderIds = orderIds;
  }

  static fromData(payload: CustomerProps) {
    return new this(payload);
  }

  static create(payload: Omit<CustomerProps, 'id'>) {
    return new this({ ...payload, id: UUID() });
  }

  acceptOrder({ id: orderId }: DraftedOrder) {
    this.orderIds.push(orderId);
  }
}
