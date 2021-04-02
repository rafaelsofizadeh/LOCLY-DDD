import { Binary } from 'mongodb';

import { muuidToEntityId, stringToMuuid } from '../../../../common/utils';

import { Item, ItemProps } from '../../../domain/entity/Item';
import { Address, AddressProps } from '../../../domain/entity/Address';
import { Order, OrderStatus, ShipmentCost } from '../../../domain/entity/Order';
import { Country } from '../../../domain/data/Country';
import { DraftedOrder } from '../../../domain/entity/DraftedOrder';
import { ConfirmedOrder } from '../../../domain/entity/ConfirmedOrder';
import { ReceivedByHostOrder } from '../../../domain/entity/ReceivedByHostOrder';

// TODO(GLOBAL): EntityIdToString type, but for EntityId->Binary
export type ItemMongoSubdocument = Omit<ItemProps, 'id'> & {
  _id: Binary;
};

export type DraftedOrderMongoDocument = {
  _id: Binary;
  status: OrderStatus;
  customerId: Binary;
  originCountry: Country;
  items: ItemMongoSubdocument[];
  shipmentCost: ShipmentCost;
  destination: AddressProps;
};

export type ConfirmedOrderMongoDocument = {
  _id: Binary;
  status: OrderStatus;
  originCountry: Country;
  hostId: Binary;
};

export type ReceivedByHostOrderMongoDocument = {
  _id: Binary;
  status: OrderStatus;
  receivedByHostDate: Date;
};

export type OrderMongoDocument =
  | DraftedOrderMongoDocument
  | ConfirmedOrderMongoDocument
  | ReceivedByHostOrderMongoDocument;

export function orderToMongoDocument(
  order: DraftedOrder,
): DraftedOrderMongoDocument {
  // For id, see: Entity { @TransformEntityIdToString() id }
  const { id, customerId, items, ...restPlainOrder } = order.serialize();

  return {
    ...restPlainOrder,
    _id: stringToMuuid(id),
    customerId: stringToMuuid(customerId),
    items: items.map(({ id, ...restItem }) => ({
      _id: stringToMuuid(id),
      ...restItem,
    })),
  };
}

export function mongoDocumentToOrder(orderDocument: OrderMongoDocument): Order {
  switch (orderDocument.status) {
    case OrderStatus.Drafted:
      return mongoDocumentToDraftedOrder(
        orderDocument as DraftedOrderMongoDocument,
      );
    case OrderStatus.Confirmed:
      return mongoDocumentToConfirmedOrder(
        orderDocument as ConfirmedOrderMongoDocument,
      );
    case OrderStatus.ReceivedByHost:
      return mongoDocumentToReceivedByHostOrder(
        orderDocument as ReceivedByHostOrderMongoDocument,
      );
    default:
      throw new Error('Invalid order status');
  }
}

export function mongoDocumentToDraftedOrder({
  _id,
  items,
  originCountry,
  customerId,
  destination,
  shipmentCost,
}: DraftedOrderMongoDocument): DraftedOrder {
  return new DraftedOrder({
    id: muuidToEntityId(_id),
    customerId: muuidToEntityId(customerId),
    items: items.map(
      ({ _id, ...restItem }) =>
        new Item({ id: muuidToEntityId(_id), ...restItem }),
    ),
    originCountry,
    destination: new Address(destination),
    shipmentCost,
  });
}

export function mongoDocumentToConfirmedOrder({
  _id,
  originCountry,
  hostId,
}: ConfirmedOrderMongoDocument): ConfirmedOrder {
  return new ConfirmedOrder({
    id: muuidToEntityId(_id),
    originCountry,
    hostId: muuidToEntityId(hostId),
  });
}

export function mongoDocumentToReceivedByHostOrder({
  _id,
  receivedByHostDate,
}: ReceivedByHostOrderMongoDocument): ReceivedByHostOrder {
  return new ReceivedByHostOrder({
    id: muuidToEntityId(_id),
    receivedByHostDate,
  });
}
