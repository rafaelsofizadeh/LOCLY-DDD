import { ClientSession } from 'mongodb';
import { UUID } from '../../common/domain';
import { Country } from '../../order/entity/Country';
import { Host } from '../../order/entity/Host';

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
    hostId: UUID,
    orderId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract findHost(
    hostId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<Host>;

  abstract deleteHost(
    hostId: UUID,
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract deleteManyHosts(
    hostIds: UUID[],
    mongoTransactionSession?: ClientSession,
  ): Promise<void>;

  abstract findHostAvailableInCountryWithMinimumNumberOfOrders(
    country: Country,
    mongoTransactionSession?: ClientSession,
  ): Promise<Host>;
}
