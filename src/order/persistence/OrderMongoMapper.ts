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
import { MUUID } from 'uuid-mongodb';
import { UUID } from '../../common/domain';

export type ItemMongoSubdocument = MongoDocument<Item>;
export type PhysicalItemMongoSubdocument = MongoDocument<PhysicalItem>;

export type OrderMongoDocument = MongoDocument<Order>;
export type DraftedOrderMongoDocument = MongoDocument<DraftedOrder>;
export type ConfirmedOrderMongoDocument = MongoDocument<ConfirmedOrder>;

export type Photo = Omit<Express.Multer.File, 'id'> & { id: UUID };
export type PhotoFile = Omit<Photo, 'id'> & { id: MUUID };
export type PhotoDocument = Omit<Photo, 'id'> & { _id: MUUID };
export type PhotoChunk = {
  _id: MUUID;
  files_id: MUUID;
  n: number;
  data: Binary;
};

export function normalizeOrderFilter({ orderId, ...restFilter }: OrderFilter) {
  return {
    ...(orderId ? { id: orderId } : {}),
    ...restFilter,
  };
}

export function normalizeItemFilter({ itemId, ...restFilter }: ItemFilter) {
  return { ...(itemId ? { id: itemId } : {}), ...restFilter };
}
