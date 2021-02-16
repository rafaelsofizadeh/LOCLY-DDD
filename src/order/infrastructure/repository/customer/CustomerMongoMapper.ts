import { Binary } from 'mongodb';
import * as MUUID from 'uuid-mongodb';

import { muuidToEntityId } from '../../../../common/utils';

import { Order } from '../../../domain/entity/Order';
import { Customer } from '../../../domain/entity/Customer';
import { Address, AddressProps } from '../../../domain/entity/Address';

type CustomerAddress = AddressProps & { selected: boolean };

export type CustomerMongoDocument = {
  _id: Binary;
  // https://devblogs.microsoft.com/typescript/announcing-typescript-4-1/#template-literal-types
  addresses: CustomerAddress[];
  orderIds: Binary[];
};

export type PopulatedCustomerMongoDocument = Omit<
  CustomerMongoDocument,
  'orderIds'
> & {
  orders: Order[];
};

export function mongoDocumentToCustomer({
  _id,
  addresses,
  orders,
}: PopulatedCustomerMongoDocument): Customer {
  return new Customer({
    id: muuidToEntityId(_id),
    selectedAddress: new Address(addresses.find(({ selected }) => selected)),
    orders: orders.map(order => new Order(order)),
  });
}

export function customerToMongoDocument(
  customer: Customer,
): CustomerMongoDocument {
  const {
    id,
    selectedAddress,
    orders,
    ...restPlainCustomer
  } = customer.serialize();

  const mongoBinaryId = MUUID.from(id);
  const mongoCustomerSelectedAddress = { ...selectedAddress, selected: true };
  const orderMongoBinaryIds = orders.map(({ id }) => MUUID.from(id));

  return {
    _id: mongoBinaryId,
    addresses: [mongoCustomerSelectedAddress],
    orderIds: orderMongoBinaryIds,
    ...restPlainCustomer,
  };
}
