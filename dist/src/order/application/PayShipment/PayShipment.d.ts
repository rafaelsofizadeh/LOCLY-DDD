import Stripe from 'stripe';
import { PayShipmentPayload, IPayShipment, PayShipmentResult } from './IPayShipment';
import { IOrderRepository } from '../../persistence/IOrderRepository';
import { TransactionUseCasePort } from '../../../common/application';
import { ICustomerRepository } from '../../../customer/persistence/ICustomerRepository';
import { IHostRepository } from '../../../host/persistence/IHostRepository';
export declare class PayShipmentService implements IPayShipment {
    private readonly orderRepository;
    private readonly customerRepository;
    private readonly hostRepository;
    private readonly stripe;
    constructor(orderRepository: IOrderRepository, customerRepository: ICustomerRepository, hostRepository: IHostRepository, stripe: Stripe);
    execute({ port: payShipmentPayload, mongoTransactionSession, }: TransactionUseCasePort<PayShipmentPayload>): Promise<PayShipmentResult>;
    private createPaymentSession;
}
