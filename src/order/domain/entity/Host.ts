import { UUID } from '../../../common/domain/UUID';

import { Address, AddressProps } from './Address';
import { ConfirmedOrder } from './ConfirmedOrder';

export interface HostProps {
  id: UUID;
  address: Address;
  available: boolean;
  orderIds: UUID[];
}

export type HostPropsPlain = Omit<HostProps, 'address'> & {
  address: AddressProps;
};

export class Host implements HostProps {
  readonly id: UUID;

  readonly address: Address;

  readonly available: boolean;

  readonly orderIds: UUID[];

  private constructor({ id, address, orderIds, available }: HostProps) {
    this.id = id;
    this.address = address;
    this.orderIds = orderIds;
    this.available = available;
  }

  static fromData(payload: HostProps) {
    return new this(payload);
  }

  static create(payload: Omit<HostProps, 'id'>) {
    return new this({ ...payload, id: UUID() });
  }

  async acceptOrder({ id: orderId }: ConfirmedOrder) {
    this.orderIds.push(orderId);
  }
}
