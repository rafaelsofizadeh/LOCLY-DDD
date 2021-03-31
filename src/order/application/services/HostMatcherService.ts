import { Injectable } from '@nestjs/common';

import { Country } from '../../domain/data/Country';
import { Host } from '../../domain/entity/Host';

import { HostMatcher } from '../port/HostMatcher';
import { HostRepository } from '../port/HostRepository';

// TODO: Service'ify service availability
export const originCountriesAvailable: Country[] = ['GBR'];
export const destinationCountriesAvailable: Country[] = ['AZE', 'ITA', 'CAN'];

@Injectable()
export class HostMatcherService implements HostMatcher {
  constructor(private hostRepository: HostRepository) {}

  checkServiceAvailability(
    originCountry: Country,
    destinationCountry: Country,
  ): boolean {
    return (
      originCountriesAvailable.includes(originCountry) &&
      destinationCountriesAvailable.includes(destinationCountry)
    );
  }

  async matchHost(country: Country): Promise<Host> {
    // Round robin
    return this.hostRepository.findHostAvailableInCountryWithMinimumNumberOfOrders(
      country,
    );
  }
}
