import { Binary } from 'mongodb';

import { muuidToUuid, uuidToMuuid } from '../../../../common/utils';

import { Host } from '../../../domain/entity/Host';
import { Address } from '../../../domain/entity/Address';

export type HostMongoDocument = {
  _id: Binary;
  address: Address;
  available: boolean;
  orderIds: Binary[];
};

export function mongoDocumentToHost({
  _id,
  address,
  available,
  orderIds,
}: HostMongoDocument): Host {
  return Host.fromData({
    id: muuidToUuid(_id),
    address,
    available,
    orderIds: orderIds.map(muuidToUuid),
  });
}

export function hostToMongoDocument(host: Host): HostMongoDocument {
  const { id, orderIds, ...restPlainHost } = host;
  const mongoBinaryId = uuidToMuuid(id);
  const orderMongoBinaryIds = orderIds.map(uuidToMuuid);

  return {
    ...restPlainHost,
    _id: mongoBinaryId,
    orderIds: orderMongoBinaryIds,
  };
}
