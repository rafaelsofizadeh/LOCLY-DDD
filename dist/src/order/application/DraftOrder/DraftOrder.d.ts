import { IOrderRepository } from '../../persistence/IOrderRepository';
import { ICustomerRepository } from '../../../customer/persistence/ICustomerRepository';
import { DraftOrderPayload, IDraftOrder } from './IDraftOrder';
import { TransactionUseCasePort } from '../../../common/application';
import { DraftedOrder } from '../../entity/Order';
export declare class DraftOrder implements IDraftOrder {
    private readonly customerRepository;
    private readonly orderRepository;
    constructor(customerRepository: ICustomerRepository, orderRepository: IOrderRepository);
    execute({ port: draftOrderPayload, mongoTransactionSession, }: TransactionUseCasePort<DraftOrderPayload>): Promise<DraftedOrder>;
    private draftOrder;
    private constructDraftOrder;
    private approximateShipmentCost;
}
