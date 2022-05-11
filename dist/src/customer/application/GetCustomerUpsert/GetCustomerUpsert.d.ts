import { ClientSession } from 'mongodb';
import { TransactionUseCasePort } from '../../../common/application';
import { GetCustomerUpsertPayload, GetCustomerUpsertResult, IGetCustomerUpsert } from './IGetCustomerUpsert';
import { IGetCustomer } from '../GetCustomer/IGetCustomer';
import { ICreateCustomer } from '../CreateCustomer/ICreateCustomer';
export declare class GetCustomerUpsert implements IGetCustomerUpsert {
    private readonly getCustomer;
    private readonly createCustomer;
    constructor(getCustomer: IGetCustomer, createCustomer: ICreateCustomer);
    execute({ port: getCustomerUpsertPayload, mongoTransactionSession, }: TransactionUseCasePort<GetCustomerUpsertPayload>): Promise<GetCustomerUpsertResult>;
    getCustomerUpsert(getCustomerUpsertPayload: GetCustomerUpsertPayload, mongoTransactionSession: ClientSession): Promise<GetCustomerUpsertResult>;
}
