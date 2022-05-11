import { ClientSession } from 'mongodb';
import { UUID } from '../../common/domain';
import { ItemFilter } from '../entity/Item';
import { Order, DraftedOrder, OrderFilter, OrderStatus } from '../entity/Order';
import { AddItemPhotosResult } from '../application/AddItemPhotos/IAddItemPhotos';
import { FileUpload, FileUploadResult } from './OrderMongoMapper';
declare type AllowedOrderProperties<K extends keyof Order = any, S extends OrderStatus | false = false> = Omit<OrderFilter, Exclude<keyof OrderFilter, K> | 'orderId' | 'status'> & (S extends false ? {} : {
    status?: S;
});
declare type OrderFilterWithStatus<S extends OrderStatus> = Omit<OrderFilter, 'status'> & {
    status: S;
};
export declare abstract class IOrderRepository {
    abstract addOrder(order: DraftedOrder, mongoTransactionSession?: ClientSession): Promise<void>;
    abstract findOrder(filter: OrderFilter, mongoTransactionSession?: ClientSession, throwIfNotFound?: boolean): Promise<Order>;
    abstract findOrders(orderIds: UUID[], mongoTransactionSession?: ClientSession): Promise<Order[]>;
    abstract deleteOrder(filter: OrderFilter, mongoTransactionSession?: ClientSession): Promise<void>;
    abstract deleteOrders(orderIds: UUID[], mongoTransactionSession?: ClientSession): Promise<void>;
    abstract setProperties(filter: OrderFilterWithStatus<OrderStatus.Drafted>, properties: AllowedOrderProperties<'status' | 'hostId' | 'items' | 'originCountry' | 'destination' | 'initialShipmentCost' | 'hostAddress', OrderStatus.Confirmed>, mongoTransactionSession?: ClientSession): Promise<void>;
    abstract setProperties(filter: OrderFilterWithStatus<OrderStatus.Confirmed>, properties: AllowedOrderProperties<'status' | 'totalWeight' | 'finalShipmentCost' | 'calculatorResultUrl' | 'deliveryEstimateDays', OrderStatus.Finalized>, mongoTransactionSession?: ClientSession): Promise<void>;
    abstract setProperties(filter: OrderFilterWithStatus<OrderStatus.Finalized>, properties: AllowedOrderProperties<'status', OrderStatus.Paid>, mongoTransactionSession?: ClientSession): Promise<void>;
    abstract setProperties(filter: OrderFilterWithStatus<OrderStatus.Paid>, properties: never, mongoTransactionSession?: ClientSession): Promise<void>;
    abstract setProperties(filter: Omit<OrderFilter, 'status'>, properties: Omit<OrderFilter, 'id'>, mongoTransactionSession?: ClientSession): Promise<void>;
    abstract setItemProperties(orderFilter: OrderFilter, itemFilter: ItemFilter, properties: Omit<ItemFilter, 'itemId'>, mongoTransactionSession?: ClientSession): Promise<void>;
    abstract addItemPhotos(orderFilter: OrderFilter, itemFilter: ItemFilter, photos: FileUpload[], mongoTransactionSession?: ClientSession): Promise<AddItemPhotosResult>;
    abstract addFile(orderFilter: OrderFilter, file: FileUpload, mongoTransactionSession?: ClientSession): Promise<FileUploadResult>;
}
export {};
