import { Binary } from 'mongodb';
import * as MUUID from 'uuid-mongodb';
import { classToPlain } from 'class-transformer';

import { Host, HostProps } from '../../../domain/entity/Host';
import { Address, AddressProps } from '../../../domain/entity/Address';
import { muuidToEntityId } from '../../../../common/utils';
import { Order, OrderProps } from '../../../domain/entity/Order';
import { MongoIdToEntityId } from '../../../../common/types';

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

export function hostToMongoDocument(host: HostProps): HostMongoDocument {
  // For id, see: Entity { @Transform() id }
  const { id: rawId, orders, ...restPlainHost } = classToPlain(host) as Omit<
    MongoIdToEntityId<HostMongoDocument>,
    'orderIds'
  > & { orders: OrderProps[] };

  const mongoBinaryId = MUUID.from(rawId);
  const orderMongoBinaryIds = orders.map(({ id }) => MUUID.from(id.value));

  return {
    ...restPlainHost,
    _id: mongoBinaryId,
    orderIds: orderMongoBinaryIds,
  };
}
