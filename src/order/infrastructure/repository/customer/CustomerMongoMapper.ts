import { Binary } from 'mongodb';
import { classToPlain } from 'class-transformer';
import * as MUUID from 'uuid-mongodb';

import { Customer, CustomerProps } from '../../../domain/entity/Customer';
import { Address, AddressProps } from '../../../domain/entity/Address';
import { muuidToEntityId } from '../../../../common/utils';
import { MongoIdToEntityId } from '../../../../common/types';
import { Order, OrderProps } from '../../../domain/entity/Order';

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
  customer: CustomerProps,
): CustomerMongoDocument {
  // For id, see: Entity { @Transform() id }
  const {
    id: rawId,
    selectedAddress,
    orders,
    ...restPlainCustomer
  } = classToPlain(customer) as Omit<
    MongoIdToEntityId<CustomerMongoDocument>,
    'addresses' | 'orderIds'
  > & {
    selectedAddress: AddressProps;
    orders: OrderProps[];
  };

  const mongoBinaryId = MUUID.from(rawId);
  const mongoCustomerSelectedAddress = { ...selectedAddress, selected: true };
  const orderMongoBinaryIds = orders.map(({ id }) => MUUID.from(id.value));

  return {
    _id: mongoBinaryId,
    addresses: [mongoCustomerSelectedAddress],
    orderIds: orderMongoBinaryIds,
    ...restPlainCustomer,
  };
}
