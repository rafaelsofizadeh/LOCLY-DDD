import { IOrderRepository } from '../../persistence/IOrderRepository';
import { TransactionUseCasePort } from '../../../common/application';
import { ReceiveItemPayload, ReceiveItemResult, IReceiveItem } from './IReceiveItem';
export declare class ReceiveItem implements IReceiveItem {
    private readonly orderRepository;
    constructor(orderRepository: IOrderRepository);
    execute({ port: { orderId, itemId, hostId }, mongoTransactionSession, }: TransactionUseCasePort<ReceiveItemPayload>): Promise<ReceiveItemResult>;
    private handleOrderItemReceipt;
}
