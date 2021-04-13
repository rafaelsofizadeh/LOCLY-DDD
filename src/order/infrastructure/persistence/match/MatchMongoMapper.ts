import { Binary } from 'mongodb';
import { uuidToMuuid, muuidToUuid } from '../../../../common/utils';

import { Match } from '../../../application/port/MatchCache';

export type MatchMongoDocument = {
  _id: Binary;
  orderId: Binary;
  hostId: Binary;
};

export function mongoDocumentToMatch({
  _id,
  orderId,
  hostId,
}: MatchMongoDocument): Match {
  return {
    id: muuidToUuid(_id),
    orderId: muuidToUuid(orderId),
    hostId: muuidToUuid(hostId),
  };
}

export function matchToMongoDocument({
  id,
  orderId,
  hostId,
}: Match): MatchMongoDocument {
  const mongoBinaryId = uuidToMuuid(id);
  const orderMongoBinaryId = uuidToMuuid(orderId);
  const hostMongoBinaryId = uuidToMuuid(hostId);

  return {
    _id: mongoBinaryId,
    orderId: orderMongoBinaryId,
    hostId: hostMongoBinaryId,
  };
}
