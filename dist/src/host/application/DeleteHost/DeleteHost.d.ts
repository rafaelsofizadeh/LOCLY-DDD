import { IOrderRepository } from '../../../order/persistence/IOrderRepository';
import { IHostRepository } from '../../../host/persistence/IHostRepository';
import { TransactionUseCasePort } from '../../../common/application';
import { DeleteHostPayload, IDeleteHost } from './IDeleteHost';
export declare class DeleteHost implements IDeleteHost {
    private readonly hostRepository;
    private readonly orderRepository;
    constructor(hostRepository: IHostRepository, orderRepository: IOrderRepository);
    execute({ port: deleteHostPayload, mongoTransactionSession, }: TransactionUseCasePort<DeleteHostPayload>): Promise<void>;
    private deleteHost;
}
