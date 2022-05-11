import { ClientSession } from 'mongodb';
import { UUID } from '../../common/domain';
import { Country } from '../../order/entity/Country';
import { Host, HostFilter } from '../entity/Host';
export declare type AllowedHostProperties = Omit<HostFilter, 'hostId'>;
export declare abstract class IHostRepository {
    abstract addHost(host: Host, mongoTransactionSession?: ClientSession): Promise<void>;
    abstract addManyHosts(hosts: Host[], mongoTransactionSession?: ClientSession): Promise<void>;
    abstract addOrderToHost(filter: HostFilter, orderId: UUID, mongoTransactionSession?: ClientSession): Promise<void>;
    abstract findHost(filter: HostFilter, mongoTransactionSession?: ClientSession, throwIfNotFound?: boolean): Promise<Host>;
    abstract deleteHost(filter: HostFilter, mongoTransactionSession?: ClientSession): Promise<void>;
    abstract deleteManyHosts(hostIds: UUID[], mongoTransactionSession?: ClientSession): Promise<void>;
    abstract setProperties(filter: HostFilter, properties: AllowedHostProperties, mongoTransactionSession?: ClientSession): Promise<void>;
    abstract findHostAvailableInCountryWithMinimumNumberOfOrders(country: Country, mongoTransactionSession?: ClientSession): Promise<Host>;
}
