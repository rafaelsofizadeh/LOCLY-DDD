import { Binary } from 'mongodb';
import * as MUUID from 'uuid-mongodb';

import { muuidToEntityId } from '../../../../common/utils';

import { Host } from '../../../domain/entity/Host';
import { Address, AddressProps } from '../../../domain/entity/Address';

export type HostMongoDocument = {
  _id: Binary;
  address: AddressProps;
  available: boolean;
  orderIds: Binary[];
};

export function mongoDocumentToHost({
  _id,
  address,
  available,
  orderIds,
}: HostMongoDocument): Host {
  return new Host({
    id: muuidToEntityId(_id),
    address: new Address(address),
    available,
    orderIds: orderIds.map(muuidToEntityId),
  });
}

export function hostToMongoDocument(host: Host): HostMongoDocument {
  // For id, see: Entity { @Transform() id }
  const { id, orderIds, ...restPlainHost } = host.serialize();
  const mongoBinaryId = MUUID.from(id);
  const orderMongoBinaryIds = orderIds.map(MUUID.from);

  return {
    ...restPlainHost,
    _id: mongoBinaryId,
    orderIds: orderMongoBinaryIds,
  };
}
