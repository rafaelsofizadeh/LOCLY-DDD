import { Binary } from 'mongodb';

import { muuidToUuid, stringToMuuid } from '../../../../common/utils';

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
import { UUID } from '../../../../common/domain/UUID';

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
    status: OrderStatus.Drafted,
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
    status: OrderStatus.Confirmed,
    physicalItems: physicalItems.map(({ id, ...restPhysicalItem }) => ({
      _id: stringToMuuid(id),
      ...restPhysicalItem,
    })),
  };
}

export function mongoDocumentToOrder(orderDocument: OrderMongoDocument): Order {
  const entries = Object.entries(orderDocument).map(([key, value]) => {
    if (value instanceof Binary) {
      return serializeBinaryValues(key, value);
    }

    if (key === 'destination') {
      return ['destination', new Address(value)];
    }

    if (key === 'items') {
      return [
        'items',
        (value as ItemMongoSubdocument[]).map(itemMongoSubdocumentToItem),
      ];
    }

    if (key === 'physicalItems') {
      return [
        'physicalItems',
        (value as ItemMongoSubdocument[]).map(
          itemMongoSubdocumentToPhysicalItem,
        ),
      ];
    }

    return [key, value];
  }, {} as OrderMongoDocument);

  const payload = Object.fromEntries(entries);

  if (isDraftedOrderMongoDocument(orderDocument)) {
    return DraftedOrder.fromData(payload);
  } else if (isConfirmedOrderMongoDocument(orderDocument)) {
    return ConfirmedOrder.fromData(payload);
  } else if (isReceivedByHostOrderMongoDocument(orderDocument)) {
    return ReceivedByHostOrder.fromData(payload);
  } else if (isVerifiedByHostOrderMongoDocument(orderDocument)) {
    return VerifiedByHostOrder.fromData(payload);
  }

  throw new Error('Invalid order status');
}

function serializeBinaryValues(key: '_id', value: Binary): ['id', UUID];
function serializeBinaryValues(
  key: string,
  value: Binary,
): [string, UUID | Binary];
function serializeBinaryValues(
  key: string,
  value: Binary,
): [string, UUID | Binary] {
  const binaryValue = value;

  const uuidValue = muuidToUuid(binaryValue);

  if (key === '_id') {
    return ['id', uuidValue];
  }

  if (typeof key === 'string' && key.includes('Id')) {
    return [key, uuidValue];
  }

  return [key, binaryValue];
}

function itemMongoSubdocumentToItem(
  itemSubdocument: ItemMongoSubdocument,
): Item {
  const entries = Object.entries(itemSubdocument).map(([key, value]) => {
    if (isBinary(value)) {
      return serializeBinaryValues(key, value);
    }

    return [key, value];
  }, {} as ItemProps);

  return new Item(Object.fromEntries(entries) as ItemProps);
}

function itemMongoSubdocumentToPhysicalItem(
  itemSubdocument: ItemMongoSubdocument,
): PhysicalItem {
  const entries = Object.entries(itemSubdocument).map(([key, value]) => {
    if (isBinary(value)) {
      return serializeBinaryValues(key, value);
    }

    return [key, value];
  }, {} as ItemProps);

  return new PhysicalItem(Object.fromEntries(entries) as PhysicalItemProps);
}

function isBinary(value: any): value is Binary {
  return value instanceof Binary;
}
