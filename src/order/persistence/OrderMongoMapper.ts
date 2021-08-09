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

export type FileUpload = Omit<Express.Multer.File, 'id'> & { id: MUUID };
export type FileUploadMongoDocument = Omit<Express.Multer.File, 'id'> & {
  _id: MUUID;
};
export type FileUploadChunkMongoDocument = {
  _id: MUUID;
  files_id: MUUID;
  n: number;
  data: Binary;
};
export type FileUploadResult = { name: string; id: UUID };

export function normalizeOrderFilter({
  orderId,
  status,
  ...restFilter
}: OrderFilter) {
  return {
    ...(orderId ? { id: orderId } : {}),
    ...(status
      ? {
          status: Array.isArray(status) ? { $in: status } : status,
        }
      : {}),
    ...restFilter,
  };
}

export function normalizeItemFilter({ itemId, ...restFilter }: ItemFilter) {
  return { ...(itemId ? { id: itemId } : {}), ...restFilter };
}
