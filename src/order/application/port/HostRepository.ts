import { ClientSession } from 'mongodb';
import { UUID } from '../../../common/domain/UUID';
import { Country } from '../../domain/data/Country';
import { ConfirmedOrder } from '../../domain/entity/ConfirmedOrder';
import { Host } from '../../domain/entity/Host';

export abstract class HostRepository {
  abstract addHost(host: Host, transaction?: ClientSession): Promise<void>;

  abstract addManyHosts(
    hosts: Host[],
    transaction?: ClientSession,
  ): Promise<void>;

  // This should always be used together with OrderRepository.addHostToOrder
  abstract addOrderToHost(
    hostId: UUID,
    orderId: UUID,
    transaction?: ClientSession,
  ): Promise<void>;

  abstract findHost(hostId: UUID, transaction?: ClientSession): Promise<Host>;

  abstract deleteHost(hostId: UUID, transaction?: ClientSession): Promise<void>;

  abstract deleteManyHosts(
    hostIds: UUID[],
    transaction?: ClientSession,
  ): Promise<void>;

  abstract findHostAvailableInCountryWithMinimumNumberOfOrders(
    country: Country,
    transaction?: ClientSession,
  ): Promise<Host>;
}
