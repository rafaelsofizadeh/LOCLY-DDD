import { EntityId } from '../../../src/common/domain/EntityId';
import { Host } from '../../../src/order/domain/entity/Host';
import { Order } from '../../../src/order/domain/entity/Order';

// TODO: Redundancy with HostRepository
export abstract class HostFixture {
  abstract addManyHosts(hosts: Host[]): Promise<void>;

  abstract addHost(host: Host): Promise<void>;

  // This should always be used together with OrderRepository.addHostToOrder
  abstract addOrderToHost(host: Host, order: Order): Promise<void>;

  abstract findHost(hostId: EntityId): Promise<Host>;

  abstract deleteManyHosts(hostIds: EntityId[]): Promise<void>;

  abstract deleteHost(hostId: EntityId): Promise<void>;
}
