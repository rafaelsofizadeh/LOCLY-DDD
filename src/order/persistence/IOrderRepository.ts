import { ClientSession } from 'mongodb';
import { UUID } from '../../common/domain';
import { ItemFilter } from '../entity/Item';
import { Order, DraftedOrder, OrderFilter } from '../entity/Order';
import { ItemPhotosUploadResult } from '../application/AddItemPhoto/IAddItemPhoto';
import { Photo } from './OrderMongoMapper';

export abstract class IOrderRepository {
  abstract addOrder(
    order: DraftedOrder,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract findOrder(
    filter: OrderFilter,
    mongoTransactionSession?: ClientSession,
    throwIfNotFound?: boolean,
  ): Promise<Order>;

  abstract findOrders(
    orderIds: UUID[],
    mongoTransactionSession?: ClientSession,
  ): Promise<Order[]>;

  abstract deleteOrder(
    filter: OrderFilter,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract setProperties(
    filter: OrderFilter,
    properties: Omit<OrderFilter, 'orderId'>,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract setItemProperties(
    orderFilter: OrderFilter,
    itemFilter: ItemFilter,
    properties: Omit<ItemFilter, 'itemId'>,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract addItemPhotos(
    orderFilter: OrderFilter,
    itemFilter: ItemFilter,
    photos: Photo[],
    mongoTransactionSession?: ClientSession,
  ): Promise<ItemPhotosUploadResult>;
}
