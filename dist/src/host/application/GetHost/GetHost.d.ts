import { IHostRepository } from '../../../host/persistence/IHostRepository';
import { GetHostPayload, IGetHost } from './IGetHost';
import { Host } from '../../entity/Host';
import { TransactionUseCasePort } from '../../../common/application';
export declare class GetHost implements IGetHost {
    private readonly hostRepository;
    constructor(hostRepository: IHostRepository);
    execute({ port: getHostPayload, mongoTransactionSession, }: TransactionUseCasePort<GetHostPayload>): Promise<Host>;
}
