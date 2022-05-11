import { TransactionUseCasePort } from '../../../common/application';
import { IOrderRepository } from '../../persistence/IOrderRepository';
import { GetOrderPayload, GetOrderResult, IGetOrder } from './IGetOrder';
export declare class GetOrder implements IGetOrder {
    private readonly orderRepository;
    constructor(orderRepository: IOrderRepository);
    execute({ port: { orderId, userId, userType }, mongoTransactionSession, }: TransactionUseCasePort<GetOrderPayload>): Promise<GetOrderResult>;
}
