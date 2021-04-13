import { Binary } from 'mongodb';

import { muuidToUuid, stringToMuuid } from '../../../../common/utils';

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
    id: muuidToUuid(_id),
    address: new Address(address),
    available,
    orderIds: orderIds.map(muuidToUuid),
  });
}

export function hostToMongoDocument(host: Host): HostMongoDocument {
  const { id, orderIds, ...restPlainHost } = host.serialize();
  const mongoBinaryId = stringToMuuid(id);
  const orderMongoBinaryIds = orderIds.map(stringToMuuid);

  return {
    ...restPlainHost,
    _id: mongoBinaryId,
    orderIds: orderMongoBinaryIds,
  };
}
