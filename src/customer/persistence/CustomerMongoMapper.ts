import { Binary } from 'mongodb';

import { Customer, CustomerFilter } from '../entity/Customer';
import {
  convertToMongoDocument,
  serializeMongoData,
} from '../../common/persistence';
import { Address } from '../../common/domain';

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
  const customerMongoDocument: CustomerMongoDocument = convertToMongoDocument(
    customer,
  );
  return customerMongoDocument;
}

export function normalizeCustomerFilter({
  customerId,
  ...restFilter
}: CustomerFilter) {
  return {
    ...(customerId && { id: customerId }),
    ...restFilter,
  };
}
