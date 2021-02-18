import { EntityId } from '../../../common/domain/EntityId';
import { Host } from '../../domain/entity/Host';
import { Order } from '../../domain/entity/Order';

export abstract class HostRepository {
  abstract addHost(host: Host): Promise<void>;

  // This should always be used together with OrderRepository.addHostToOrder
  abstract addOrderToHost(host: Host, order: Order): Promise<void>;

  abstract deleteHost(hostId: EntityId): Promise<void>;

  abstract findHostAvailableInCountryWithMinimumNumberOfOrders(
    country: string,
  ): Promise<Host>;
}
