import { Binary } from 'mongodb';

import { Customer, CustomerFilter } from '../entity/Customer';
import { Address } from '../../order/entity/Order';
import {
  convertToMongoDocument,
  serializeMongoData,
} from '../../common/persistence';

type CustomerAddress = Address & { selected: boolean };

export type CustomerMongoDocument = {
  _id: Binary;
  // https://devblogs.microsoft.com/typescript/announcing-typescript-4-1/#template-literal-types
  addresses: CustomerAddress[];
  orderIds: Binary[];
};

export function mongoDocumentToCustomer({
  addresses,
  ...restCustomerMongoDocument
}: CustomerMongoDocument): Customer {
  const { selected, ...selectedAddress } = addresses.find(
    ({ selected }) => selected,
  );

  const serializedCustomerMongoDocument = serializeMongoData({
    ...restCustomerMongoDocument,
    selectedAddress,
  });

  return serializedCustomerMongoDocument;
}

export function customerToMongoDocument(
  customer: Customer,
): CustomerMongoDocument {
  const { _id, selectedAddress, ...restCustomer } = convertToMongoDocument(
    customer,
  );

  return {
    ...restCustomer,
    _id,
    addresses: [{ ...selectedAddress, selected: true }],
  };
}

export function normalizeCustomerFilter({
  customerId,
  ...restFilter
}: CustomerFilter) {
  return {
    ...(customerId ? { id: customerId } : {}),
    ...restFilter,
  };
}
