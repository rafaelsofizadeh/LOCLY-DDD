import { Binary } from 'mongodb';

import { muuidToEntityId, stringToMuuid } from '../../../../common/utils';

import { Item, ItemProps } from '../../../domain/entity/Item';
import { Address, AddressProps } from '../../../domain/entity/Address';
import { Order, OrderStatus, ShipmentCost } from '../../../domain/entity/Order';
import { Country } from '../../../domain/data/Country';

// TODO(GLOBAL): EntityIdToString type, but for EntityId->Binary
export type ItemMongoSubdocument = Omit<ItemProps, 'id'> & {
  _id: Binary;
};

export type OrderMongoDocument = {
  _id: Binary;
  status: OrderStatus;
  customerId: Binary;
  hostId?: Binary;
  originCountry: Country;
  items: ItemMongoSubdocument[];
  shipmentCost: ShipmentCost;
  destination: AddressProps;
};

export function orderToMongoDocument(order: Order): OrderMongoDocument {
  // For id, see: Entity { @TransformEntityIdToString() id }
  const {
    id,
    customerId,
    hostId,
    items,
    ...restPlainOrder
  } = order.serialize();

  const mongoBinaryId = stringToMuuid(id);
  const customerMongoBinaryId = stringToMuuid(customerId);

  return {
    ...restPlainOrder,
    _id: mongoBinaryId,
    customerId: customerMongoBinaryId,
    ...(hostId ? { hostId: stringToMuuid(hostId) } : {}),
    items: items.map(({ id, ...restItem }) => ({
      _id: stringToMuuid(id),
      ...restItem,
    })),
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
    items: items.map(
      ({ _id, ...restItem }) =>
        new Item({ id: muuidToEntityId(_id), ...restItem }),
    ),
    originCountry,
    destination: new Address(destination),
  });
}
