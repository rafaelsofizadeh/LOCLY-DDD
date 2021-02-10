import { Host } from '../../domain/entity/Host';

export abstract class HostRepository {
  abstract findHostAvailableInCountryWithMinimumNumberOfOrders(
    country: string,
  ): Promise<Host>;
}
