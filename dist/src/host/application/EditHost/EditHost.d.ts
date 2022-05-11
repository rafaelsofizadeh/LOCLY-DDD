import { TransactionUseCasePort } from '../../../common/application';
import { IHostRepository } from '../../persistence/IHostRepository';
import { EditHostPayload, IEditHost } from './IEditHost';
export declare class EditHost implements IEditHost {
    private readonly hostRepository;
    constructor(hostRepository: IHostRepository);
    execute({ port: editHostPayload, mongoTransactionSession, }: TransactionUseCasePort<EditHostPayload>): Promise<void>;
    private editHost;
}
