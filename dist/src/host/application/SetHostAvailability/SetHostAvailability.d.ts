import { TransactionUseCasePort } from '../../../common/application';
import { IHostRepository } from '../../persistence/IHostRepository';
import { SetHostAvailabilityPayload, ISetHostAvailability } from './ISetHostAvailability';
export declare class SetHostAvailability implements ISetHostAvailability {
    private readonly hostRepository;
    constructor(hostRepository: IHostRepository);
    execute({ port: setHostAvailabilityPayload, mongoTransactionSession, }: TransactionUseCasePort<SetHostAvailabilityPayload>): Promise<void>;
    private setHostAvailability;
}
