import { ClientSession } from 'mongodb';
import { UUID } from '../../common/domain';
import { ItemFilter } from '../entity/Item';
import { Order, DraftedOrder, OrderFilter, OrderStatus } from '../entity/Order';
import { ItemPhotosUploadResult } from '../application/AddItemPhoto/IAddItemPhoto';
import { Photo } from './OrderMongoMapper';

/**
 * Pick a non-extendable set of order properties.
 * Regulate which value 'status' can be set to.
 *
 * Uses Omit<, Exclude<>> instead of Pick<> to simulate a nominal type,
 * i.e. disallow all properties except the allowed properties.
 */
type AllowedOrderProperties<
  K extends keyof Order = any,
  S extends OrderStatus | false = false
> = Omit<OrderFilter, Exclude<keyof OrderFilter, K> | 'orderId' | 'status'> &
  S extends false
  ? {}
  : {
      status?: S;
    };

type OrderFilterWithStatus<S extends OrderStatus> = Omit<
  OrderFilter,
  'status'
> & {
  status: S;
};

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
    filter: OrderFilterWithStatus<OrderStatus.Drafted>,
    properties: AllowedOrderProperties<
      | 'status'
      | 'hostId'
      | 'items'
      | 'originCountry'
      | 'destination'
      | 'initialShipmentCost',
      OrderStatus.Confirmed
    >,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract setProperties(
    filter: OrderFilterWithStatus<OrderStatus.Confirmed>,
    properties: AllowedOrderProperties<
      'status' | 'totalWeight' | 'finalShipmentCost' | 'calculatorResultUrl',
      OrderStatus.Finalized
    >,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract setProperties(
    filter: OrderFilterWithStatus<OrderStatus.Finalized>,
    properties: AllowedOrderProperties<'status', OrderStatus.Paid>,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract setProperties(
    filter: OrderFilterWithStatus<OrderStatus.Paid>,
    properties: never,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract setProperties(
    filter: Omit<OrderFilter, 'status'>,
    properties: Omit<OrderFilter, 'id'>,
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
