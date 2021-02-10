import { Binary } from 'mongodb';
import * as MUUID from 'uuid-mongodb';

import { EntityId } from '../../../../common/domain/EntityId';
import { Customer } from '../../../domain/entity/Customer';
import { Address, AddressProps } from '../../../domain/entity/Address';
import { muuidToEntityId } from '../../../../common/utils';

type CustomerAddress = AddressProps & { selected: boolean };

export type CustomerMongoDocument = {
  _id: Binary;
  // https://devblogs.microsoft.com/typescript/announcing-typescript-4-1/#template-literal-types
  addresses: CustomerAddress[];
};

export function mongoDocumentToCustomer({
  _id,
  addresses,
}: CustomerMongoDocument): Customer {
  return new Customer({
    id: muuidToEntityId(_id),
    selectedAddress: new Address(addresses.find(({ selected }) => selected)),
  });
}
