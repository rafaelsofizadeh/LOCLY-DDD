import { IOrderRepository } from '../../persistence/IOrderRepository';
import { ICustomerRepository } from '../../../customer/persistence/ICustomerRepository';
import { TransactionUseCasePort } from '../../../common/application';
import { DeleteOrderPayload, IDeleteOrder } from './IDeleteOrder';
export declare class DeleteOrder implements IDeleteOrder {
    private readonly customerRepository;
    private readonly orderRepository;
    constructor(customerRepository: ICustomerRepository, orderRepository: IOrderRepository);
    execute({ port: deleteOrderPayload, mongoTransactionSession, }: TransactionUseCasePort<DeleteOrderPayload>): Promise<void>;
    private deleteOrder;
}
