import { Host } from '../../domain/entity/Host';
import { Order } from '../../domain/entity/Order';

export abstract class HostRepository {
  abstract addHost(host: Host): Promise<void>;

  abstract deleteHost(host: Host): Promise<void>;

  abstract findHostAvailableInCountryWithMinimumNumberOfOrders(
    country: string,
  ): Promise<Host>;
}
