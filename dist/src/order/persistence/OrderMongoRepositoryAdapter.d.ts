import { ClientSession, Collection } from 'mongodb';
import { UUID } from '../../common/domain';
import { IOrderRepository } from './IOrderRepository';
import { Order, DraftedOrder, OrderFilter } from '../entity/Order';
import { OrderMongoDocument, FileUpload, FileUploadResult } from './OrderMongoMapper';
import { ItemFilter } from '../entity/Item';
import { AddItemPhotosResult } from '../application/AddItemPhotos/IAddItemPhotos';
export declare class OrderMongoRepositoryAdapter implements IOrderRepository {
    private readonly orderCollection;
    constructor(orderCollection: Collection<OrderMongoDocument>);
    addOrder(draftOrder: DraftedOrder, mongoTransactionSession?: ClientSession): Promise<void>;
    setProperties(filter: OrderFilter, properties: OrderFilter, mongoTransactionSession?: ClientSession): Promise<void>;
    findOrder(filter: OrderFilter, mongoTransactionSession?: ClientSession, throwIfNotFound?: boolean): Promise<Order>;
    findOrders(orderIds: UUID[], mongoTransactionSession?: ClientSession): Promise<Order[]>;
    deleteOrder(filter: OrderFilter, mongoTransactionSession?: ClientSession): Promise<void>;
    deleteOrders(orderIds: UUID[], mongoTransactionSession?: ClientSession): Promise<void>;
    setItemProperties(orderFilter: OrderFilter, itemFilter: ItemFilter, properties: Omit<ItemFilter, 'itemId'>, mongoTransactionSession?: ClientSession): Promise<void>;
    addItemPhotos(orderFilter: OrderFilter, itemFilter: ItemFilter, photos: FileUpload[], mongoTransactionSession?: ClientSession): Promise<AddItemPhotosResult>;
    addFile(orderFilter: OrderFilter, file: FileUpload, mongoTransactionSession?: ClientSession): Promise<FileUploadResult>;
}
