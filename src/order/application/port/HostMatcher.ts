import { Host } from '../../domain/entity/Host';
import { Order } from '../../domain/entity/Order';

export abstract class HostMatcher {
  abstract checkServiceAvailability(
    originCountry: string,
    destinationCountry: string,
  ): boolean | Promise<boolean>;

  abstract matchHost(country: string): Promise<Host>;
}
