import { ClientSession } from 'mongodb';
import { UUID } from '../../common/domain';
import { Country } from '../../order/entity/Country';
import { Host, HostFilter } from '../entity/Host';

export abstract class IHostRepository {
  abstract addHost(
    host: Host,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract addManyHosts(
    hosts: Host[],
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  // This should always be used together with IOrderRepository.addHostToOrder
  abstract addOrderToHost(
    filter: HostFilter,
    orderId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract findHost(
    filter: HostFilter,
    mongoTransactionSession?: ClientSession,
  ): Promise<Host>;

  abstract deleteHost(
    filter: HostFilter,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract deleteManyHosts(
    hostIds: UUID[],
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract setProperties(
    filter: HostFilter,
    // TODO: type is almost the same as OrderFilter
    properties: Omit<HostFilter, 'hostId'>,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract findHostAvailableInCountryWithMinimumNumberOfOrders(
    country: Country,
    mongoTransactionSession?: ClientSession,
  ): Promise<Host>;
}
