import { Binary } from 'mongodb';
import * as MUUID from 'uuid-mongodb';

import { muuidToEntityId } from '../../../../common/utils';

import { Host } from '../../../domain/entity/Host';
import { Order } from '../../../domain/entity/Order';
import { Address, AddressProps } from '../../../domain/entity/Address';

export type HostMongoDocument = {
  _id: Binary;
  address: AddressProps;
  available: boolean;
  orderIds: Binary[];
};

export type PopulatedHostMongoDocument = Omit<HostMongoDocument, 'orderIds'> & {
  orders: Order[];
};

export function mongoDocumentToHost({
  _id,
  address,
  available,
  orders,
}: PopulatedHostMongoDocument): Host {
  return new Host({
    id: muuidToEntityId(_id),
    address: new Address(address),
    available,
    orders: orders.map(order => new Order(order)),
  });
}

export function hostToMongoDocument(host: Host): HostMongoDocument {
  // For id, see: Entity { @Transform() id }
  const { id, orders, ...restPlainHost } = host.serialize();
  const mongoBinaryId = MUUID.from(id);
  const orderMongoBinaryIds = orders.map(({ id }) => MUUID.from(id));

  return {
    ...restPlainHost,
    _id: mongoBinaryId,
    orderIds: orderMongoBinaryIds,
  };
}
