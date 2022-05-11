import Stripe from 'stripe';
import { ICustomerRepository } from '../../persistence/ICustomerRepository';
import { TransactionUseCasePort } from '../../../common/application';
import { Customer } from '../../entity/Customer';
import { CreateCustomerPayload, ICreateCustomer } from './ICreateCustomer';
export declare class CreateCustomer extends ICreateCustomer {
    private readonly customerRepository;
    private readonly stripe;
    constructor(customerRepository: ICustomerRepository, stripe: Stripe);
    execute({ port: createCustomerPayload, mongoTransactionSession, }: TransactionUseCasePort<CreateCustomerPayload>): Promise<Customer>;
    private createCustomer;
    private referralCode;
}
