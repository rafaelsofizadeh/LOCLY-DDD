import { TransactionUseCasePort } from '../../../../../common/application';
import { PayShipmentWebhookPayload, PayShipmentWebhookResult, IPayShipmentHandler } from './IPayShipmentHandler';
import { IOrderRepository } from '../../../../persistence/IOrderRepository';
export declare class PayShipmentHandler implements IPayShipmentHandler {
    private readonly orderRepository;
    constructor(orderRepository: IOrderRepository);
    execute({ port: payShipmentRequest, mongoTransactionSession, }: TransactionUseCasePort<PayShipmentWebhookPayload>): Promise<PayShipmentWebhookResult>;
    private markOrderPaid;
}
