import { ICustomerRepository } from '../../persistence/ICustomerRepository';
import { TransactionUseCasePort } from '../../../common/application';
import { GetCustomerPayload, IGetCustomer } from './IGetCustomer';
import { Customer } from '../../entity/Customer';
export declare class GetCustomer implements IGetCustomer {
    private readonly customerRepository;
    constructor(customerRepository: ICustomerRepository);
    execute({ port: getCustomerPayload, mongoTransactionSession, }: TransactionUseCasePort<GetCustomerPayload>): Promise<Customer>;
}
