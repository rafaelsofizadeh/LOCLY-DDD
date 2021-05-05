import { Binary } from 'mongodb';

import { ItemProps } from '../../../domain/entity/Item';
import { Address } from '../../../domain/entity/Address';
import { Order, OrderStatus, ShipmentCost } from '../../../domain/entity/Order';
import { Country } from '../../../domain/data/Country';
import { DraftOrder } from '../../../domain/entity/DraftOrder';
import { ConfirmOrder } from '../../../domain/entity/ConfirmOrder';
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
  receivedDate: Date;
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
  '_id' | 'status' | 'receivedDate'
>;

export type Photo = Omit<Express.Multer.File, 'id'> & { id: Binary };

export type OrderMongoDocument =
  | DraftedOrderMongoDocument
  | ConfirmedOrderMongoDocument
  | ReceivedOrderItemMongoDocument;

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

export function draftOrderToMongoDocument(
  draftOrder: DraftOrder,
): DraftedOrderMongoDocument {
  const draftedOrderMongoDocument = convertToMongoDocument(draftOrder);
  return {
    ...draftedOrderMongoDocument,
    status: OrderStatus.Drafted,
  };
}

export function mongoDocumentToOrder(orderDocument: OrderMongoDocument): Order {
  const payload = serializeMongoData(orderDocument);

  if (isDraftedOrderMongoDocument(orderDocument)) {
    return DraftOrder.fromData(
      payload as SerializedMongoDocument<DraftedOrderMongoDocument>,
    );
  }

  if (isConfirmedOrderMongoDocument(orderDocument)) {
    return ConfirmOrder.fromData(
      payload as SerializedMongoDocument<ConfirmedOrderMongoDocument>,
    );
  }

  throw new Error('Invalid order status');
}
