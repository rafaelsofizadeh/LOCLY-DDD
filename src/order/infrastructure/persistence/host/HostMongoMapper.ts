import { Binary } from 'mongodb';

import { uuidToMuuid } from '../../../../common/utils';

import { Host } from '../../../domain/entity/Host';
import { Address } from '../../../domain/entity/Address';
import { serializeMongoData } from '../utils';

export type HostMongoDocument = {
  _id: Binary;
  address: Address;
  available: boolean;
  orderIds: Binary[];
};

export function mongoDocumentToHost(
  hostMongoDocument: HostMongoDocument,
): Host {
  const serializedHostMongoDocument = serializeMongoData(hostMongoDocument);

  return Host.fromData(serializedHostMongoDocument);
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
