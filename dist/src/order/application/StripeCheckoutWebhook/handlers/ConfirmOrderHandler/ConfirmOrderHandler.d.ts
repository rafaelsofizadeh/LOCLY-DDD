import { TransactionUseCasePort } from '../../../../../common/application';
import { ConfirmOrderWebhookPayload, IConfirmOrderHandler, ConfirmOrderWebhookResult } from './IConfirmOrderHandler';
import { IHostRepository } from '../../../../../host/persistence/IHostRepository';
import { IOrderRepository } from '../../../../../order/persistence/IOrderRepository';
import { ICustomerRepository } from '../../../../../customer/persistence/ICustomerRepository';
export declare class ConfirmOrderHandler implements IConfirmOrderHandler {
    private readonly orderRepository;
    private readonly customerRepository;
    private readonly hostRepository;
    constructor(orderRepository: IOrderRepository, customerRepository: ICustomerRepository, hostRepository: IHostRepository);
    execute({ port: confirmOrderRequest, mongoTransactionSession, }: TransactionUseCasePort<ConfirmOrderWebhookPayload>): Promise<ConfirmOrderWebhookResult>;
    private confirmOrder;
    private updateBalanceAfterDiscount;
    private referralReward;
}
