import { ClientSession, Collection } from 'mongodb';
import { UUID } from '../../common/domain';
import { AllowedCustomerProperties, ICustomerRepository } from './ICustomerRepository';
import { Customer, CustomerFilter } from '../entity/Customer';
import { CustomerMongoDocument } from './CustomerMongoMapper';
declare enum ArrayAction {
    Add = "add",
    Remove = "remove"
}
export declare class CustomerMongoRepositoryAdapter implements ICustomerRepository {
    private readonly customerCollection;
    constructor(customerCollection: Collection<CustomerMongoDocument>);
    addCustomer(customer: Customer, mongoTransactionSession?: ClientSession): Promise<void>;
    deleteCustomer(filter: CustomerFilter, mongoTransactionSession?: ClientSession): Promise<void>;
    addOrder(filter: CustomerFilter, orderId: UUID, mongoTransactionSession?: ClientSession): Promise<void>;
    removeOrder(filter: CustomerFilter, orderId: UUID, mongoTransactionSession?: ClientSession): Promise<void>;
    addOrRemoveEntityToArrayProp<P extends keyof Customer, R extends Pick<Customer, P>[P] extends Array<infer E> ? E : never>(action: ArrayAction, filter: CustomerFilter, prop: Pick<Customer, P>[P] extends any[] ? P : never, entity: R, mongoTransactionSession?: ClientSession): Promise<void>;
    findCustomer(filter: CustomerFilter, mongoTransactionSession?: ClientSession, throwIfNotFound?: boolean): Promise<Customer>;
    setProperties(filter: CustomerFilter, properties: AllowedCustomerProperties, mongoTransactionSession?: ClientSession): Promise<void>;
    updateBalance(filter: CustomerFilter, deltaUsdCents: number, mongoTransactionSession: ClientSession): Promise<void>;
}
export {};
