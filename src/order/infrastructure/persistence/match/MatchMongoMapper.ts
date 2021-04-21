import { Binary } from 'mongodb';
import { uuidToMuuid } from '../../../../common/utils';

import { Match } from '../../../application/port/match/MatchRecorder';
import { serializeMongoData } from '../utils';

// _id === orderId
export type MatchMongoDocument = {
  _id: Binary;
  hostId: Binary;
};

export function mongoDocumentToMatch(
  matchMongoDocument: MatchMongoDocument,
): Match {
  const { id, ...serializedMatchMongoDocument } = serializeMongoData(
    matchMongoDocument,
  );

  return {
    ...serializedMatchMongoDocument,
    orderId: id,
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
