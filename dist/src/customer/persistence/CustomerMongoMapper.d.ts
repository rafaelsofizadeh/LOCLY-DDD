import { Binary } from 'mongodb';
import { Customer, CustomerFilter } from '../entity/Customer';
import { Address } from '../../common/domain';
export declare type CustomerMongoDocument = {
    _id: Binary;
    addresses: Address[];
    orderIds: Binary[];
};
export declare function mongoDocumentToCustomer(customerMongoDocument: CustomerMongoDocument): Customer;
export declare function customerToMongoDocument(customer: Customer): CustomerMongoDocument;
export declare function normalizeCustomerFilter({ customerId, ...restFilter }: CustomerFilter): {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    orderIds?: string[];
    balanceUsdCents?: number;
    referralCode?: string;
    refereeCustomerId?: string;
    stripeCustomerId?: string;
    addresses?: Readonly<{
        addressLine1: string;
        addressLine2?: string;
        locality: string;
        administrativeArea?: string;
        country: import("../../order/entity/Country").Country;
        postalCode?: string;
    }>[];
    status?: import("../../order/entity/Order").OrderStatus | import("../../order/entity/Order").OrderStatus[];
    id: string;
};
