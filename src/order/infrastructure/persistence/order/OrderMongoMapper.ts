import { Binary } from 'mongodb';

import { muuidToEntityId, stringToMuuid } from '../../../../common/utils';

import { Item, ItemProps } from '../../../domain/entity/Item';
import { Address, AddressProps } from '../../../domain/entity/Address';
import { Order, OrderStatus, ShipmentCost } from '../../../domain/entity/Order';
import { Country } from '../../../domain/data/Country';

export type OrderMongoDocument = {
  _id: Binary;
  status: OrderStatus;
  customerId: Binary;
  hostId: Binary;
  originCountry: Country;
  items: ItemProps[];
  shipmentCost: ShipmentCost;
  destination: AddressProps;
};

export function orderToMongoDocument(order: Order): OrderMongoDocument {
  // For id, see: Entity { @TransformEntityIdToString() id }
  const { id, customerId, hostId, ...restPlainOrder } = order.serialize();

  const mongoBinaryId = stringToMuuid(id);
  const customerMongoBinaryId = stringToMuuid(customerId);
  let hostMongoBinaryId: Binary;

  // TODO: Better way to handle optional values
  if (hostId) {
    hostMongoBinaryId = stringToMuuid(hostId);
  }

  return {
    ...restPlainOrder,
    _id: mongoBinaryId,
    customerId: customerMongoBinaryId,
    hostId: hostMongoBinaryId,
  };
}

export function mongoDocumentToOrder({
  _id,
  items,
  originCountry,
  customerId,
  hostId,
  destination,
}: OrderMongoDocument): Order {
  return new Order({
    id: muuidToEntityId(_id),
    customerId: muuidToEntityId(customerId),
    // TODO: Better way to handle optional properties
    hostId: hostId ? muuidToEntityId(hostId) : undefined,
    items: items.map(item => new Item(item)),
    originCountry,
    destination: new Address(destination),
  });
}
