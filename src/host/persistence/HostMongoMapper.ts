import { Binary } from 'mongodb';

import { Host } from '../../order/entity/Host';
import { Address } from '../../order/entity/Order';
import {
  serializeMongoData,
  convertToMongoDocument,
} from '../../common/persistence';

export type HostMongoDocument = {
  _id: Binary;
  address: Address;
  available: boolean;
  orderIds: Binary[];
};

export function mongoDocumentToHost(
  hostMongoDocument: HostMongoDocument,
): Host {
  return serializeMongoData(hostMongoDocument);
}

export function hostToMongoDocument(host: Host): HostMongoDocument {
  const { _id, ...restHost } = convertToMongoDocument(host);

  return {
    ...restHost,
    _id,
  };
}
