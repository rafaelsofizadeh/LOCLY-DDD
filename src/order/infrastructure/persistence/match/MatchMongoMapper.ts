import { Binary } from 'mongodb';

import { Match } from '../../../application/port/MatchRecorder';
import { convertToMongoDocument, serializeMongoData } from '../utils';

// _id === orderId
export type MatchMongoDocument = {
  _id: Binary;
  hostId: Binary;
};

export function mongoDocumentToMatch(
  matchMongoDocument: MatchMongoDocument,
): Match {
  const { id: orderId, hostId } = serializeMongoData(matchMongoDocument);

  return {
    orderId,
    hostId,
  };
}

export function matchToMongoDocument(match: Match): MatchMongoDocument {
  const { orderId: _id, hostId } = convertToMongoDocument(match);

  return {
    _id,
    hostId,
  };
}
