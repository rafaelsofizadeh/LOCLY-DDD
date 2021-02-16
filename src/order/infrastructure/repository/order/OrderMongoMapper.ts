import { Binary } from 'mongodb';
import * as MUUID from 'uuid-mongodb';

import { muuidToEntityId } from '../../../../common/utils';

import { Customer } from '../../../domain/entity/Customer';
import { Item, ItemProps } from '../../../domain/entity/Item';
import { Address, AddressProps } from '../../../domain/entity/Address';
import { Order, OrderStatus, ShipmentCost } from '../../../domain/entity/Order';

export type OrderMongoDocument = {
  _id: Binary;
  status: OrderStatus;
  customerId: Binary;
  originCountry: string;
  items: ItemProps[];
  shipmentCost: ShipmentCost;
  destination: AddressProps;
};

export type PopulatedOrderMongoDocument = Omit<
  OrderMongoDocument,
  'customerId'
> & { customer: Customer };

// TOFIX
export function orderToMongoDocument(order: Order): OrderMongoDocument {
  // For id, see: Entity { @Transform() id }
  const { id, customer, ...restPlainOrder } = order.serialize();

  const mongoBinaryId = MUUID.from(id);
  const customerMongoBinaryId = MUUID.from(customer.id);

  return {
    ...restPlainOrder,
    _id: mongoBinaryId,
    customerId: customerMongoBinaryId,
  };
}

export function mongoDocumentToOrder({
  _id,
  items,
  originCountry,
  destination,
  customer,
}: PopulatedOrderMongoDocument): Order {
  return new Order({
    id: muuidToEntityId(_id),
    customer,
    items: items.map(item => new Item(item)),
    originCountry,
    destination: new Address(destination),
  });
}
