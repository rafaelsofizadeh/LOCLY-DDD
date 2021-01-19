import { Binary } from 'mongodb';
import * as MUUID from 'uuid-mongodb';

import { Item, ItemProps } from '../../../domain/entity/Item';
import { Order, OrderStatus, ShipmentCost } from '../../../domain/entity/Order';
import { Address, AddressProps } from '../../../domain/entity/Address';
import { UniqueEntityID } from '../../../../common/domain/UniqueEntityId';

export type OrderMongoDocument = {
  _id: Binary;
  // https://devblogs.microsoft.com/typescript/announcing-typescript-4-1/#template-literal-types
  status: OrderStatus;
  customerId: Binary;
  originCountry: string;
  items: ItemProps[];
  shipmentCost: ShipmentCost;
  destination: AddressProps;
};

export function orderToMongoDocument({
  id,
  status,
  customer: { id: customerId },
  originCountry,
  items,
  shipmentCost,
  destination,
}: Order): OrderMongoDocument {
  return {
    _id: uniqueEntityIdToMongoId(id),
    customerId: uniqueEntityIdToMongoId(customerId),
    status,
    originCountry,
    items: items.map(item => serializeItem(item)),
    shipmentCost,
    destination: serializeAddress(destination),
  };
}

function uniqueEntityIdToMongoId(id: UniqueEntityID) {
  console.log(id, id.toValue());
  return MUUID.from(id.toValue());
}

function serializeAddress(address: Address) {
  return { country: address.country };
}

function serializeItem(item: Item) {
  return {
    title: item.title,
    storeName: item.storeName,
    category: item.category,
    weight: item.weight,
    width: item.width,
    length: item.length,
    height: item.height,
  };
}
