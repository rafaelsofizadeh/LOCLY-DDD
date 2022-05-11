import { TransactionUseCasePort } from '../../../../../common/application';
import { IHostRepository } from '../../../../persistence/IHostRepository';
import { IUpdateHostAccount, UpdateHostAccountPayload } from './IUpdateHostAccountHandler';
export declare class UpdateHostAccountHandler implements IUpdateHostAccount {
    private readonly hostRepository;
    constructor(hostRepository: IHostRepository);
    execute({ port: updateHostAccountPayload, mongoTransactionSession, }: TransactionUseCasePort<UpdateHostAccountPayload>): Promise<void>;
    private updateHostAccount;
    private isHostVerified;
}
