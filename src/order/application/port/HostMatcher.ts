import { Country } from '../../domain/data/Country';
import { Host } from '../../domain/entity/Host';

export abstract class HostMatcher {
  abstract checkServiceAvailability(
    originCountry: Country,
    destinationCountry: Country,
  ): boolean | Promise<boolean>;

  abstract matchHost(country: Country): Promise<Host>;
}
