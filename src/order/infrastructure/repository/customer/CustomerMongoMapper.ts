import { Binary } from 'mongodb';
import * as MUUID from 'uuid-mongodb';

import { muuidToEntityId } from '../../../../common/utils';

import { Customer } from '../../../domain/entity/Customer';
import { Address, AddressProps } from '../../../domain/entity/Address';

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

export function customerToMongoDocument(
  customer: Customer,
): CustomerMongoDocument {
  const { id, selectedAddress, ...restPlainCustomer } = customer.serialize();

  const mongoBinaryId = MUUID.from(id);
  const mongoCustomerSelectedAddress = { ...selectedAddress, selected: true };

  return {
    _id: mongoBinaryId,
    addresses: [mongoCustomerSelectedAddress],
    ...restPlainCustomer,
  };
}
