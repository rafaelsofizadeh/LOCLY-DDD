import { TransactionUseCasePort } from '../../../common/application';
import { ICustomerRepository } from '../../persistence/ICustomerRepository';
import { EditCustomerPayload, IEditCustomer } from './IEditCustomer';
export declare class EditCustomer implements IEditCustomer {
    private readonly customerRepository;
    constructor(customerRepository: ICustomerRepository);
    execute({ port: editCustomerPayload, mongoTransactionSession, }: TransactionUseCasePort<EditCustomerPayload>): Promise<void>;
    private editCustomer;
}
