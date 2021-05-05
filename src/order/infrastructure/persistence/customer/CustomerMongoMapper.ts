import { Binary } from 'mongodb';

import { Customer } from '../../../domain/entity/Customer';
import { Address } from '../../../domain/entity/Address';
import {
  convertToMongoDocument,
  serializeMongoData,
} from '../../../../common/persistence';

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
  const { _id, selectedAddress, orderIds } = convertToMongoDocument(customer);

  return {
    _id,
    orderIds,
    addresses: [{ ...selectedAddress, selected: true }],
  };
}
