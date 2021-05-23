import { Binary } from 'mongodb';

import { Host, HostFilter } from '../entity/Host';
import {
  serializeMongoData,
  convertToMongoDocument,
} from '../../common/persistence';
import { Address } from '../../common/domain';

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
  const hostMongoDocument: HostMongoDocument = convertToMongoDocument(host);

  return hostMongoDocument;
}

export function normalizeHostFilter({ hostId, ...restFilter }: HostFilter) {
  return {
    ...(hostId ? { id: hostId } : {}),
    ...restFilter,
  };
}
