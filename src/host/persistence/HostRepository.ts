import { ClientSession } from 'mongodb';
import { UUID } from '../../common/domain';
import { Country } from '../../order/entity/Country';
import { Host } from '../../order/entity/Host';

export abstract class HostRepository {
  abstract addHost(host: Host, session?: ClientSession): Promise<void>;

  abstract addManyHosts(hosts: Host[], session?: ClientSession): Promise<void>;

  // This should always be used together with OrderRepository.addHostToOrder
  abstract addOrderToHost(
    hostId: UUID,
    orderId: UUID,
    session?: ClientSession,
  ): Promise<void>;

  abstract findHost(hostId: UUID, session?: ClientSession): Promise<Host>;

  abstract deleteHost(hostId: UUID, session?: ClientSession): Promise<void>;

  abstract deleteManyHosts(
    hostIds: UUID[],
    session?: ClientSession,
  ): Promise<void>;

  abstract findHostAvailableInCountryWithMinimumNumberOfOrders(
    country: Country,
    session?: ClientSession,
  ): Promise<Host>;
}
