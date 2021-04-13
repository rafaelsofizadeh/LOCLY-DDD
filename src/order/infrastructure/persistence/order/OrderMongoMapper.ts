import { Binary } from 'mongodb';

import { muuidToEntityId, stringToMuuid } from '../../../../common/utils';

import { Item, ItemProps } from '../../../domain/entity/Item';
import { Address, AddressProps } from '../../../domain/entity/Address';
import { Order, OrderStatus, ShipmentCost } from '../../../domain/entity/Order';
import { Country } from '../../../domain/data/Country';
import { DraftedOrder } from '../../../domain/entity/DraftedOrder';
import { ConfirmedOrder } from '../../../domain/entity/ConfirmedOrder';
import { ReceivedByHostOrder } from '../../../domain/entity/ReceivedByHostOrder';
import { VerifiedByHostOrder } from '../../../domain/entity/VerifiedByHostOrder';
import {
  PhysicalItem,
  PhysicalItemProps,
} from '../../../domain/entity/PhysicalItem';

// TODO(GLOBAL): EntityIdToString type, but for UUID->Binary
export type ItemMongoSubdocument = Omit<ItemProps, 'id'> & {
  _id: Binary;
};

export type PhysicalItemMongoSubdocument = Omit<PhysicalItemProps, 'id'> & {
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

export type VerifiedByHostOrderMongoDocument = {
  _id: Binary;
  status: OrderStatus;
  originCountry: Country;
  items: ItemMongoSubdocument[];
  shipmentCost: ShipmentCost;
  destination: AddressProps;
};

export type VerifiedByHostOrderMongoDocumentProps = {
  _id: Binary;
  status: OrderStatus;
  originCountry: Country;
  physicalItems: PhysicalItemMongoSubdocument[];
  shipmentCost: ShipmentCost;
  destination: AddressProps;
};

export type OrderMongoDocument =
  | DraftedOrderMongoDocument
  | ConfirmedOrderMongoDocument
  | ReceivedByHostOrderMongoDocument
  | VerifiedByHostOrderMongoDocument;

// TODO: instanceof-based order type guards
export function isDraftedOrderMongoDocument(
  orderMongoDocument: OrderMongoDocument,
): orderMongoDocument is DraftedOrderMongoDocument {
  return orderMongoDocument.status === OrderStatus.Drafted;
}

export function isConfirmedOrderMongoDocument(
  orderMongoDocument: OrderMongoDocument,
): orderMongoDocument is ConfirmedOrderMongoDocument {
  return orderMongoDocument.status === OrderStatus.Confirmed;
}

export function isReceivedByHostOrderMongoDocument(
  orderMongoDocument: OrderMongoDocument,
): orderMongoDocument is ReceivedByHostOrderMongoDocument {
  return orderMongoDocument.status === OrderStatus.ReceivedByHost;
}

export function isVerifiedByHostOrderMongoDocument(
  orderMongoDocument: OrderMongoDocument,
): orderMongoDocument is VerifiedByHostOrderMongoDocument {
  return orderMongoDocument.status === OrderStatus.VerifiedByHost;
}

export function draftedOrderToMongoDocument(
  draftedOrder: DraftedOrder,
): DraftedOrderMongoDocument {
  const { id, customerId, items, ...restPlainOrder } = draftedOrder.serialize();

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

export function serializeVerifiedByHostOrderToMongoDocumentProps(
  verifiedByHostOrder: VerifiedByHostOrder,
): VerifiedByHostOrderMongoDocumentProps {
  const {
    id,
    physicalItems,
    ...restPlainOrder
  } = verifiedByHostOrder.serialize();

  return {
    ...restPlainOrder,
    _id: stringToMuuid(id),
    physicalItems: physicalItems.map(({ id, ...restPhysicalItem }) => ({
      _id: stringToMuuid(id),
      ...restPhysicalItem,
    })),
  };
}

export function mongoDocumentToOrder(orderDocument: OrderMongoDocument): Order {
  if (isDraftedOrderMongoDocument(orderDocument)) {
    return mongoDocumentToDraftedOrder(orderDocument);
  } else if (isConfirmedOrderMongoDocument(orderDocument)) {
    return mongoDocumentToConfirmedOrder(orderDocument);
  } else if (isReceivedByHostOrderMongoDocument(orderDocument)) {
    return mongoDocumentToReceivedByHostOrder(orderDocument);
  } else if (isVerifiedByHostOrderMongoDocument(orderDocument)) {
    return mongoDocumentToVerifiedByHostOrder(orderDocument);
  }

  throw new Error('Invalid order status');
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

export function mongoDocumentToVerifiedByHostOrder({
  _id,
  items,
  originCountry,
  destination,
  shipmentCost,
}: VerifiedByHostOrderMongoDocument): VerifiedByHostOrder {
  return new VerifiedByHostOrder({
    id: muuidToEntityId(_id),
    physicalItems: items.map(
      ({ _id, title, storeName, category, ...restPhysicalItem }) =>
        new PhysicalItem({ id: muuidToEntityId(_id), ...restPhysicalItem }),
    ),
    originCountry,
    destination: new Address(destination),
    shipmentCost,
  });
}
