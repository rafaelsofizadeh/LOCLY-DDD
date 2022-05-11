import { Binary } from 'mongodb';
import { Host, HostFilter } from '../entity/Host';
import { Address } from '../../common/domain';
export declare type HostMongoDocument = {
    _id: Binary;
    address: Address;
    available: boolean;
    orderIds: Binary[];
};
export declare function mongoDocumentToHost(hostMongoDocument: HostMongoDocument): Host;
export declare function hostToMongoDocument(host: Host): HostMongoDocument;
export declare function normalizeHostFilter({ hostId, ...restFilter }: HostFilter): {
    country?: import("../../order/entity/Country").Country;
    address?: Readonly<{
        addressLine1: string;
        addressLine2?: string;
        locality: string;
        administrativeArea?: string;
        country: import("../../order/entity/Country").Country;
        postalCode?: string;
    }>;
    email?: string;
    verified?: boolean;
    available?: boolean;
    stripeAccountId?: string;
    firstName?: string;
    lastName?: string;
    orderIds?: string[];
    profileComplete?: boolean;
    status?: import("../../order/entity/Order").OrderStatus | import("../../order/entity/Order").OrderStatus[];
    id: string;
};
