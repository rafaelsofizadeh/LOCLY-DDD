import { Injectable } from '@nestjs/common';
import { Host } from '../../domain/entity/Host';
import { HostMatcher } from '../port/HostMatcher';
import { HostRepository } from '../port/HostRepository';

@Injectable()
export class MatchHost implements HostMatcher {
  constructor(private hostRepository: HostRepository) {}

  checkServiceAvailability(
    originCountry: string,
    destinationCountry: string,
  ): boolean {
    const originCountriesAvailable = ['AUS', 'USA'];
    const destinationCountriesAvailable = ['AZE', 'ITA'];

    return (
      originCountriesAvailable.includes(originCountry) &&
      destinationCountriesAvailable.includes(destinationCountry)
    );
  }

  async matchHost(country: string): Promise<Host> {
    // Round robin
    return this.hostRepository.findHostAvailableInCountryWithMinimumNumberOfOrders(
      country,
    );
  }
}
