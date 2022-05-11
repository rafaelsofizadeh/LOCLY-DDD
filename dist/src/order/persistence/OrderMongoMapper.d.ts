/// <reference types="multer" />
/// <reference types="multer-gridfs-storage" />
import { Binary } from 'mongodb';
import { Item, ItemFilter } from '../entity/Item';
import { DraftedOrder, Order, OrderFilter, ConfirmedOrder } from '../entity/Order';
import { PhysicalItem } from '../entity/Item';
import { MongoDocument } from '../../common/persistence';
import { MUUID } from 'uuid-mongodb';
import { UUID } from '../../common/domain';
export declare type ItemMongoSubdocument = MongoDocument<Item>;
export declare type PhysicalItemMongoSubdocument = MongoDocument<PhysicalItem>;
export declare type OrderMongoDocument = MongoDocument<Order>;
export declare type DraftedOrderMongoDocument = MongoDocument<DraftedOrder>;
export declare type ConfirmedOrderMongoDocument = MongoDocument<ConfirmedOrder>;
export declare type FileUpload = Omit<Express.Multer.File, 'id'> & {
    id: MUUID;
};
export declare type FileUploadMongoDocument = Omit<Express.Multer.File, 'id'> & {
    _id: MUUID;
};
export declare type FileUploadChunkMongoDocument = {
    _id: MUUID;
    files_id: MUUID;
    n: number;
    data: Binary;
};
export declare type FileUploadResult = {
    name: string;
    id: UUID;
};
export declare function normalizeOrderFilter({ orderId, status, ...restFilter }: OrderFilter): {
    items?: Item[];
    destination?: Readonly<{
        addressLine1: string;
        addressLine2?: string;
        locality: string;
        administrativeArea?: string;
        country: import("../entity/Country").Country;
        postalCode?: string;
    }>;
    hostAddress?: Readonly<{
        addressLine1: string;
        addressLine2?: string;
        locality: string;
        administrativeArea?: string;
        country: import("../entity/Country").Country;
        postalCode?: string;
    }>;
    hostId?: string;
    originCountry?: import("../entity/Country").Country;
    customerId?: string;
    initialShipmentCost?: Readonly<{
        currency: import("../entity/Currency").Currency;
        amount: number;
    }>;
    totalWeight?: number;
    finalShipmentCost?: Readonly<{
        currency: import("../entity/Currency").Currency;
        amount: number;
    }>;
    calculatorResultUrl?: string;
    deliveryEstimateDays?: number;
    proofOfPayment?: string;
    trackingNumber?: string;
    status: import("../entity/Order").OrderStatus | {
        $in: import("../entity/Order").OrderStatus[];
    };
    id: string;
};
export declare function normalizeItemFilter({ itemId, ...restFilter }: ItemFilter): {
    url?: string;
    title?: string;
    weight?: number;
    photoIds?: string[];
    receivedDate?: Date;
    status?: import("../entity/Order").OrderStatus | import("../entity/Order").OrderStatus[];
    id: string;
};
