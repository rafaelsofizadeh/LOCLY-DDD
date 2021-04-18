import { Binary } from 'mongodb';
import { muuidToUuid, uuidToMuuid } from '../../../../common/utils';

import { Match } from '../../../application/port/MatchRecorder';

// _id === orderId
export type MatchMongoDocument = {
  _id: Binary;
  hostId: Binary;
};

export function mongoDocumentToMatch({
  _id,
  hostId,
}: MatchMongoDocument): Match {
  return {
    orderId: muuidToUuid(_id),
    hostId: muuidToUuid(hostId),
  };
}

export function matchToMongoDocument({
  orderId,
  hostId,
}: Match): MatchMongoDocument {
  const orderMongoBinaryId = uuidToMuuid(orderId);
  const hostMongoBinaryId = uuidToMuuid(hostId);

  return {
    _id: orderMongoBinaryId,
    hostId: hostMongoBinaryId,
  };
}
