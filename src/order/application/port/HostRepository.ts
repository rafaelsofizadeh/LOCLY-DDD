import { Host } from '../../domain/entity/Host';

export abstract class HostRepository {
  abstract findAvailableHostInCountry(country: string): Host | Promise<Host>;
}
