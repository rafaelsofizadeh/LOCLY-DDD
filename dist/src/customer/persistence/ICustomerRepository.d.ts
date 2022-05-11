import { ClientSession } from 'mongodb';
import { UUID } from '../../common/domain';
import { Customer, CustomerFilter } from '../entity/Customer';
export declare type AllowedCustomerProperties = Omit<CustomerFilter, 'customerId' | 'referralCode'>;
export declare abstract class ICustomerRepository {
    abstract addCustomer(customer: Customer, mongoTransactionSession?: ClientSession): Promise<void>;
    abstract deleteCustomer(filter: CustomerFilter, mongoTransactionSession?: ClientSession): Promise<void>;
    abstract addOrder(filter: CustomerFilter, orderId: UUID, mongoTransactionSession?: ClientSession): Promise<void>;
    abstract removeOrder(filter: CustomerFilter, orderId: UUID, mongoTransactionSession?: ClientSession): Promise<void>;
    abstract setProperties(filter: CustomerFilter, properties: AllowedCustomerProperties, mongoTransactionSession?: ClientSession): Promise<void>;
    abstract updateBalance(filter: CustomerFilter, deltaUsdCents: number, mongoTransactionSession?: ClientSession): Promise<void>;
    abstract findCustomer(filter: CustomerFilter, mongoTransactionSession?: ClientSession, throwIfNotFound?: boolean): Promise<Customer>;
}
