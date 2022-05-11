import { IOrderRepository } from '../../../order/persistence/IOrderRepository';
import { ICustomerRepository } from '../../../customer/persistence/ICustomerRepository';
import { TransactionUseCasePort } from '../../../common/application';
import { DeleteCustomerPayload, IDeleteCustomer } from './IDeleteCustomer';
export declare class DeleteCustomer implements IDeleteCustomer {
    private readonly customerRepository;
    private readonly orderRepository;
    constructor(customerRepository: ICustomerRepository, orderRepository: IOrderRepository);
    execute({ port: deleteCustomerPayload, mongoTransactionSession, }: TransactionUseCasePort<DeleteCustomerPayload>): Promise<void>;
    private deleteCustomer;
}
