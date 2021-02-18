import { Host } from '../../domain/entity/Host';

export abstract class HostMatcher {
  abstract checkServiceAvailability(
    originCountry: string,
    destinationCountry: string,
  ): boolean | Promise<boolean>;

  abstract matchHost(country: string): Promise<Host>;
}
