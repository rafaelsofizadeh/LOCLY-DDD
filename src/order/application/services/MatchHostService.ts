import { Injectable } from '@nestjs/common';
import { Host } from '../../domain/entity/Host';
import { HostMatcher } from '../port/HostMatcher';
import { HostRepository } from '../port/HostRepository';

// TODO: Service'ify service availability
export const originCountriesAvailable = ['AUS', 'USA', 'AZE'];
export const destinationCountriesAvailable = ['AZE', 'ITA', 'CAN'];

@Injectable()
export class MatchHost implements HostMatcher {
  constructor(private hostRepository: HostRepository) {}

  checkServiceAvailability(
    originCountry: string,
    destinationCountry: string,
  ): boolean {
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
