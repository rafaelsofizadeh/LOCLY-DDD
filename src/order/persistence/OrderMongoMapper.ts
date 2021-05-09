import { Binary } from 'mongodb';
import { Item, ItemFilter } from '../entity/Item';
import {
  DraftedOrder,
  Order,
  OrderFilter,
  ConfirmedOrder,
} from '../entity/Order';
import { PhysicalItem } from '../entity/Item';
import { MongoDocument } from '../../common/persistence';

export type ItemMongoSubdocument = MongoDocument<Item>;
export type PhysicalItemMongoSubdocument = MongoDocument<PhysicalItem>;

export type OrderMongoDocument = MongoDocument<Order>;
export type DraftedOrderMongoDocument = MongoDocument<DraftedOrder>;
export type ConfirmedOrderMongoDocument = MongoDocument<ConfirmedOrder>;

export type Photo = Omit<Express.Multer.File, 'id'> & { id: Binary };

export function normalizeOrderFilter({ orderId, ...restFilter }: OrderFilter) {
  return {
    id: orderId,
    ...restFilter,
  };
}

export function normalizeItemFilter({ itemId, ...restFilter }: ItemFilter) {
  return { id: itemId, ...restFilter };
}
