import { Binary } from 'mongodb';
import * as MUUID from 'uuid-mongodb';

import { muuidToEntityId } from '../../../../common/utils';

import { Host } from '../../../domain/entity/Host';
import { Address, AddressProps } from '../../../domain/entity/Address';

export type HostMongoDocument = {
  _id: Binary;
  address: AddressProps;
  available: boolean;
};

export function mongoDocumentToHost({
  _id,
  address,
  available,
}: HostMongoDocument): Host {
  return new Host({
    id: muuidToEntityId(_id),
    address: new Address(address),
    available,
  });
}

export function hostToMongoDocument(host: Host): HostMongoDocument {
  // For id, see: Entity { @Transform() id }
  const { id, ...restPlainHost } = host.serialize();
  const mongoBinaryId = MUUID.from(id);

  return {
    ...restPlainHost,
    _id: mongoBinaryId,
  };
}
