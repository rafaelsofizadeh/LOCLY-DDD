import { Binary } from 'mongodb';

import { Gram, Item, ItemFilter } from '../../../domain/entity/Item';
import {
  Address,
  DraftOrder,
  DraftedOrderStatus,
  Order,
  OrderStatus,
  Cost,
  OrderFilter,
} from '../../../domain/entity/Order';
import { Country } from '../../../domain/data/Country';
import { PhysicalItem } from '../../../domain/entity/Item';
import {
  convertToMongoDocument,
  SerializedMongoDocument,
  serializeMongoData,
} from '../../../../common/persistence';

export type ItemMongoSubdocument = Omit<Item, 'id'> & {
  _id: Binary;
};

export type PhysicalItemMongoSubdocument = Omit<PhysicalItem, 'id'> & {
  _id: Binary;
};

// TODO(typing): ConvertedToMongoDocument<AnyOrder>
type AnyOrderMongoDocument = {
  readonly _id: Binary;
  readonly status: OrderStatus;
  readonly customerId: Binary;
  readonly hostId: Binary;
  readonly originCountry: Country;
  readonly items: ItemMongoSubdocument[];
  readonly shipmentCost: Cost;
  readonly destination: Address;
  readonly receivedDate: Date;
  readonly totalWeight: Gram;
  readonly deliveryCost: Cost;
  readonly calculatorResultUrl?: URL;
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

export function draftOrderToMongoDocument(
  draftOrder: DraftOrder,
): DraftedOrderMongoDocument {
  const draftedOrderMongoDocument = convertToMongoDocument(draftOrder);
  return {
    ...draftedOrderMongoDocument,
    status: DraftedOrderStatus,
  };
}

export function mongoDocumentToOrder(orderDocument: OrderMongoDocument): Order {
  return serializeMongoData(orderDocument) as SerializedMongoDocument<
    AnyOrderMongoDocument
  >;
}

export function normalizeOrderFilter({ orderId, ...restFilter }: OrderFilter) {
  return { id: orderId, ...restFilter };
}

export function normalizeItemFilter({ itemId, ...restFilter }: ItemFilter) {
  return { id: itemId, ...restFilter };
}
