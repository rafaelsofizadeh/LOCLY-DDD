import { Binary } from 'mongodb';

import { ItemProps } from '../../../domain/entity/Item';
import { Address } from '../../../domain/entity/Address';
import { Order, OrderStatus, ShipmentCost } from '../../../domain/entity/Order';
import { Country } from '../../../domain/data/Country';
import { DraftOrder } from '../../../domain/entity/DraftOrder';
import { ConfirmOrder } from '../../../domain/entity/ConfirmOrder';
import { ReceiveOrderItem } from '../../../domain/entity/ReceiveOrderItem';
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

export type ReceivedOrderItemMongoDocument = Pick<
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

export type Photo = {
  name: string;
  file: Express.Multer.File;
};

export type OrderMongoDocument =
  | DraftedOrderMongoDocument
  | ConfirmedOrderMongoDocument
  | ReceivedOrderItemMongoDocument
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

export function isReceivedOrderItemMongoDocument(
  orderMongoDocument: OrderMongoDocument,
): orderMongoDocument is ReceivedOrderItemMongoDocument {
  return orderMongoDocument.status === OrderStatus.ReceivedByHost;
}

export function isVerifiedByHostOrderMongoDocument(
  orderMongoDocument: OrderMongoDocument,
): orderMongoDocument is VerifiedByHostOrderMongoDocument {
  return orderMongoDocument.status === OrderStatus.VerifiedByHost;
}

export function draftOrderToMongoDocument(
  draftOrder: DraftOrder,
): DraftedOrderMongoDocument {
  return {
    ...convertToMongoDocument(draftOrder),
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
    return DraftOrder.fromData(
      payload as SerializedMongoDocument<DraftedOrderMongoDocument>,
    );
  } else if (isConfirmedOrderMongoDocument(orderDocument)) {
    return ConfirmOrder.fromData(
      payload as SerializedMongoDocument<ConfirmedOrderMongoDocument>,
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
