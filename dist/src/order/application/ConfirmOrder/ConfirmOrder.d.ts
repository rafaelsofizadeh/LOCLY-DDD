import Stripe from 'stripe';
import { ConfirmOrderResult, IConfirmOrder } from './IConfirmOrder';
import { IOrderRepository } from '../../persistence/IOrderRepository';
import { UUID } from '../../../common/domain';
import { TransactionUseCasePort } from '../../../common/application';
import { IHostRepository } from '../../../host/persistence/IHostRepository';
import { ConfirmOrderPayload } from './IConfirmOrder';
import { ICustomerRepository } from '../../../customer/persistence/ICustomerRepository';
export declare type Match = {
    orderId: UUID;
    hostId: UUID;
};
export declare class ConfirmOrder implements IConfirmOrder {
    private readonly orderRepository;
    private readonly hostRepository;
    private readonly customerRepository;
    private readonly stripe;
    constructor(orderRepository: IOrderRepository, hostRepository: IHostRepository, customerRepository: ICustomerRepository, stripe: Stripe);
    execute({ port: confirmOrderPayload, mongoTransactionSession, }: TransactionUseCasePort<ConfirmOrderPayload>): Promise<ConfirmOrderResult>;
    private matchOrderAndCheckout;
    private findMatchingHost;
    private createStripeCheckoutSession;
    private verifyBalanceAndDiscount;
}
