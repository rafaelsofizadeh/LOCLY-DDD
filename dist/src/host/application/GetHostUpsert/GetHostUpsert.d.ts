import { ClientSession } from 'mongodb';
import { GetHostUpsertPayload, GetHostUpsertResult, IGetHostUpsert } from './IGetHostUpsert';
import { IGetHost } from '../GetHost/IGetHost';
import { ICreateHost } from '../CreateHost/ICreateHost';
import { TransactionUseCasePort } from '../../../common/application';
export declare class GetHostUpsert implements IGetHostUpsert {
    private readonly getHost;
    private readonly createHost;
    constructor(getHost: IGetHost, createHost: ICreateHost);
    execute({ port: getHostUpsertPayload, mongoTransactionSession, }: TransactionUseCasePort<GetHostUpsertPayload>): Promise<GetHostUpsertResult>;
    getHostUpsert({ country, ...getHostPayload }: GetHostUpsertPayload, mongoTransactionSession: ClientSession): Promise<GetHostUpsertResult>;
}
