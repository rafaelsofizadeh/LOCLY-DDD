import { Binary } from 'mongodb';

import { muuidToUuid, stringToMuuid } from '../../../../common/utils';

import { Customer } from '../../../domain/entity/Customer';
import { Address, AddressProps } from '../../../domain/entity/Address';

type CustomerAddress = AddressProps & { selected: boolean };

export type CustomerMongoDocument = {
  _id: Binary;
  // https://devblogs.microsoft.com/typescript/announcing-typescript-4-1/#template-literal-types
  addresses: CustomerAddress[];
  orderIds: Binary[];
};

export function mongoDocumentToCustomer({
  _id,
  addresses,
  orderIds,
}: CustomerMongoDocument): Customer {
  return new Customer({
    id: muuidToUuid(_id),
    selectedAddress: new Address(addresses.find(({ selected }) => selected)),
    orderIds: orderIds.map(muuidToUuid),
  });
}

export function customerToMongoDocument(
  customer: Customer,
): CustomerMongoDocument {
  const {
    id,
    selectedAddress,
    orderIds,
    ...restPlainCustomer
  } = customer.serialize();

  const mongoBinaryId = stringToMuuid(id);
  const mongoCustomerSelectedAddress = { ...selectedAddress, selected: true };
  const orderMongoBinaryIds = orderIds.map(orderId => stringToMuuid(orderId));

  return {
    _id: mongoBinaryId,
    addresses: [mongoCustomerSelectedAddress],
    orderIds: orderMongoBinaryIds,
    ...restPlainCustomer,
  };
}
