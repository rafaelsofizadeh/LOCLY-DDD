import { Binary } from 'mongodb';

import { muuidToUuid, uuidToMuuid } from '../../../../common/utils';

import { Customer } from '../../../domain/entity/Customer';
import { Address } from '../../../domain/entity/Address';

type CustomerAddress = Address & { selected: boolean };

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
  const { selected, ...selectedAddress } = addresses.find(
    ({ selected }) => selected,
  );

  return Customer.fromData({
    id: muuidToUuid(_id),
    selectedAddress,
    orderIds: orderIds.map(muuidToUuid),
  });
}

export function customerToMongoDocument(
  customer: Customer,
): CustomerMongoDocument {
  const { id, selectedAddress, orderIds } = customer;

  const mongoBinaryId = uuidToMuuid(id);
  const mongoCustomerSelectedAddress = { ...selectedAddress, selected: true };
  const orderMongoBinaryIds = orderIds.map(orderId => uuidToMuuid(orderId));

  return {
    _id: mongoBinaryId,
    addresses: [mongoCustomerSelectedAddress],
    orderIds: orderMongoBinaryIds,
  };
}
