import { TransactionUseCasePort } from '../../../common/application';
import { ICustomerRepository } from '../../../customer/persistence/ICustomerRepository';
import { AddReferralCodePayload, IAddReferralCode } from './IAddReferralCode';
export declare class AddReferralCode extends IAddReferralCode {
    private readonly customerRepository;
    constructor(customerRepository: ICustomerRepository);
    execute({ port: addReferralCodePayload, mongoTransactionSession, }: TransactionUseCasePort<AddReferralCodePayload>): Promise<void>;
    private addReferralCode;
}
