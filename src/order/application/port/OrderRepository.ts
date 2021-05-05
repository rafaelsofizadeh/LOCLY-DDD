import { ClientSession } from 'mongodb';
import { UUID } from '../../../common/domain';
import { ItemFilter } from '../../domain/entity/Item';
import { Order, DraftOrder, OrderFilter } from '../../domain/entity/Order';
import { ItemPhotosUploadResult } from '../../domain/use-case/AddItemPhotoUseCase';
import { Photo } from '../../infrastructure/persistence/order/OrderMongoMapper';

export abstract class OrderRepository {
  abstract addOrder(order: DraftOrder, session?: ClientSession): Promise<void>;

  abstract findOrder(
    filter: OrderFilter,
    session?: ClientSession,
  ): Promise<Order>;

  abstract findOrders(
    orderIds: UUID[],
    session?: ClientSession,
  ): Promise<Order[]>;

  abstract deleteOrder(
    filter: OrderFilter,
    session?: ClientSession,
  ): Promise<void>;

  abstract setProperties(
    filter: OrderFilter,
    // TODO: type is almost the same as OrderFilter
    properties: Omit<OrderFilter, 'orderId'>,
    session?: ClientSession,
  ): Promise<void>;

  abstract setItemProperties(
    orderFilter: OrderFilter,
    itemFilter: ItemFilter,
    properties: Omit<ItemFilter, 'itemId'>,
    session?: ClientSession,
  ): Promise<void>;

  abstract addItemPhotos(
    orderFilter: OrderFilter,
    itemFilter: ItemFilter,
    photos: Photo[],
    session?: ClientSession,
  ): Promise<ItemPhotosUploadResult>;
}
