import { Binary } from 'mongodb';
import { entityIdToMuuid, muuidToEntityId } from '../../../../common/utils';

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
    id: muuidToEntityId(_id),
    orderId: muuidToEntityId(orderId),
    hostId: muuidToEntityId(hostId),
  };
}

export function matchToMongoDocument({
  id,
  orderId,
  hostId,
}: Match): MatchMongoDocument {
  const mongoBinaryId = entityIdToMuuid(id);
  const orderMongoBinaryId = entityIdToMuuid(orderId);
  const hostMongoBinaryId = entityIdToMuuid(hostId);

  return {
    _id: mongoBinaryId,
    orderId: orderMongoBinaryId,
    hostId: hostMongoBinaryId,
  };
}
