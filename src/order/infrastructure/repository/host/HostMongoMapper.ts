import { Binary } from 'mongodb';
import * as MUUID from 'uuid-mongodb';

import { EntityId } from '../../../../common/domain/EntityId';
import { Host } from '../../../domain/entity/Host';
import { Address } from '../../../domain/entity/Address';
import { muuidToEntityId } from '../../../../common/utils';

export type HostMongoDocument = {
  _id: Binary;
  address: Address;
  available: boolean;
};

export function mongoDocumentToHost({
  _id,
  address,
  available,
}: HostMongoDocument): Host {
  return new Host({
    id: muuidToEntityId(_id),
    address,
    available,
  });
}
