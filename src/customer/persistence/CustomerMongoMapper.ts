import { Binary } from 'mongodb';

import { Customer, CustomerFilter } from '../entity/Customer';
import { Address } from '../../order/entity/Order';
import {
  convertToMongoDocument,
  serializeMongoData,
} from '../../common/persistence';

export type CustomerMongoDocument = {
  _id: Binary;
  // https://devblogs.microsoft.com/typescript/announcing-typescript-4-1/#template-literal-types
  addresses: Address[];
  orderIds: Binary[];
};

export function mongoDocumentToCustomer(
  customerMongoDocument: CustomerMongoDocument,
): Customer {
  return serializeMongoData(customerMongoDocument);
}

export function customerToMongoDocument(
  customer: Customer,
): CustomerMongoDocument {
  const { _id, ...restCustomer } = convertToMongoDocument(customer);
  console.log('restCustomer', restCustomer);

  return {
    ...restCustomer,
    _id,
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
