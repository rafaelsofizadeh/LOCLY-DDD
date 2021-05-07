import { Binary } from 'mongodb';
import { Item, ItemFilter } from '../../../domain/entity/Item';
import {
  DraftedOrder,
  Order,
  OrderFilter,
  ConfirmedOrder,
} from '../../../domain/entity/Order';
import { PhysicalItem } from '../../../domain/entity/Item';
import { MongoDocument } from '../../../../common/persistence';

export type ItemMongoSubdocument = MongoDocument<Item>;
export type PhysicalItemMongoSubdocument = MongoDocument<PhysicalItem>;

export type OrderMongoDocument = MongoDocument<Order>;
export type DraftedOrderMongoDocument = MongoDocument<DraftedOrder>;
export type ConfirmedOrderMongoDocument = MongoDocument<ConfirmedOrder>;

export type Photo = Omit<Express.Multer.File, 'id'> & { id: Binary };

export function normalizeOrderFilter({
  orderId,
  status,
  ...restFilter
}: OrderFilter) {
  return {
    id: orderId,
    // TODO: Beautify
    ...(status
      ? { status: Array.isArray(status) ? { $in: status } : status }
      : {}),
    ...restFilter,
  };
}

export function normalizeItemFilter({ itemId, ...restFilter }: ItemFilter) {
  return { id: itemId, ...restFilter };
}
