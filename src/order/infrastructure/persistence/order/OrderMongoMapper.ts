import { Binary } from 'mongodb';

import { ItemProps } from '../../../domain/entity/Item';
import { Address } from '../../../domain/entity/Address';
import { Order, OrderStatus, ShipmentCost } from '../../../domain/entity/Order';
import { Country } from '../../../domain/data/Country';
import { DraftedOrder } from '../../../domain/entity/DraftedOrder';
import { ConfirmedOrder } from '../../../domain/entity/ConfirmedOrder';
import { ReceivedByHostOrder } from '../../../domain/entity/ReceivedByHostOrder';
import { VerifiedByHostOrder } from '../../../domain/entity/VerifiedByHostOrder';
import { PhysicalItemProps } from '../../../domain/entity/Item';
import {
  convertToMongoDocument,
  serializeMongoData,
  SerializedMongoDocument,
} from '../../../../common/persistence';

export type ItemMongoSubdocument = Omit<ItemProps, 'id'> & {
  _id: Binary;
};

export type PhysicalItemMongoSubdocument = Omit<PhysicalItemProps, 'id'> & {
  _id: Binary;
};

type AnyOrderMongoDocument = {
  _id: Binary;
  status: OrderStatus;
  customerId: Binary;
  hostId: Binary;
  originCountry: Country;
  items: ItemMongoSubdocument[];
  shipmentCost: ShipmentCost;
  destination: Address;
  receivedByHostDate: Date;
};

export type DraftedOrderMongoDocument = Pick<
  AnyOrderMongoDocument,
  | '_id'
  | 'status'
  | 'customerId'
  | 'originCountry'
  | 'items'
  | 'shipmentCost'
  | 'destination'
>;

export type ConfirmedOrderMongoDocument = Pick<
  AnyOrderMongoDocument,
  '_id' | 'status' | 'originCountry' | 'hostId'
>;

export type ReceivedByHostOrderMongoDocument = Pick<
  AnyOrderMongoDocument,
  '_id' | 'status' | 'receivedByHostDate'
>;

export type VerifiedByHostOrderMongoDocument = Pick<
  AnyOrderMongoDocument,
  '_id' | 'status' | 'originCountry' | 'items' | 'shipmentCost' | 'destination'
>;

export type VerifiedByHostOrderMongoDocumentProps = Omit<
  VerifiedByHostOrderMongoDocument,
  'items'
> & { physicalItems: PhysicalItemMongoSubdocument[] };

export type OrderMongoDocument =
  | DraftedOrderMongoDocument
  | ConfirmedOrderMongoDocument
  | ReceivedByHostOrderMongoDocument
  | VerifiedByHostOrderMongoDocument;

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
  return {
    ...convertToMongoDocument(draftedOrder),
    status: OrderStatus.Drafted,
  };
}

export function serializeVerifiedByHostOrderToMongoDocumentProps(
  verifiedByHostOrder: VerifiedByHostOrder,
): VerifiedByHostOrderMongoDocumentProps {
  return {
    ...convertToMongoDocument(verifiedByHostOrder),
    status: OrderStatus.Confirmed,
  };
}

export function mongoDocumentToOrder(orderDocument: OrderMongoDocument): Order {
  const payload = serializeMongoData(orderDocument);

  if (isDraftedOrderMongoDocument(orderDocument)) {
    return DraftedOrder.fromData(
      payload as SerializedMongoDocument<DraftedOrderMongoDocument>,
    );
  } else if (isConfirmedOrderMongoDocument(orderDocument)) {
    return ConfirmedOrder.fromData(
      payload as SerializedMongoDocument<ConfirmedOrderMongoDocument>,
    );
  } else if (isReceivedByHostOrderMongoDocument(orderDocument)) {
    return ReceivedByHostOrder.fromData(
      payload as SerializedMongoDocument<ReceivedByHostOrderMongoDocument>,
    );
  } else if (isVerifiedByHostOrderMongoDocument(orderDocument)) {
    const { items, ...restPayload } = payload as SerializedMongoDocument<
      VerifiedByHostOrderMongoDocument
    >;

    const physicalItems = items.map(
      ({ title, storeName, ...physicalItem }) => physicalItem,
    );

    return VerifiedByHostOrder.fromData({
      ...restPayload,
      physicalItems,
    } as SerializedMongoDocument<VerifiedByHostOrderMongoDocumentProps>);
  }

  throw new Error('Invalid order status');
}
