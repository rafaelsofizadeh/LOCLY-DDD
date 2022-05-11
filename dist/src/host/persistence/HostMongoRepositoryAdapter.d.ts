import { ClientSession, Collection } from 'mongodb';
import { AllowedHostProperties, IHostRepository } from './IHostRepository';
import { Host, HostFilter } from '../entity/Host';
import { HostMongoDocument } from './HostMongoMapper';
import { UUID } from '../../common/domain';
import { Country } from '../../order/entity/Country';
export declare class HostMongoRepositoryAdapter implements IHostRepository {
    private readonly hostCollection;
    constructor(hostCollection: Collection<HostMongoDocument>);
    addManyHosts(hosts: Host[], mongoTransactionSession?: ClientSession): Promise<void>;
    addHost(host: Host, mongoTransactionSession?: ClientSession): Promise<void>;
    deleteManyHosts(hostIds: UUID[], mongoTransactionSession?: ClientSession): Promise<void>;
    deleteHost(filter: HostFilter, mongoTransactionSession?: ClientSession): Promise<void>;
    setProperties(filter: HostFilter, properties: AllowedHostProperties, mongoTransactionSession?: ClientSession): Promise<void>;
    addOrderToHost(filter: HostFilter, orderId: UUID, mongoTransactionSession?: ClientSession): Promise<void>;
    findHost(filter: HostFilter, mongoTransactionSession?: ClientSession, throwIfNotFound?: boolean): Promise<Host>;
    findHostAvailableInCountryWithMinimumNumberOfOrders(country: Country, mongoTransactionSession?: ClientSession): Promise<Host>;
}
