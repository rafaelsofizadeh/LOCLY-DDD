import { ClientSession } from 'mongodb';
import { UUID } from '../../../../common/domain/UUID';
import { Host } from '../../../domain/entity/Host';

export abstract class TestHostRepository {
  abstract addHost(host: Host, transaction?: ClientSession): Promise<void>;

  abstract addManyHosts(
    hosts: Host[],
    transaction?: ClientSession,
  ): Promise<void>;

  abstract findHost(hostId: UUID, transaction?: ClientSession): Promise<Host>;

  abstract deleteHost(hostId: UUID, transaction?: ClientSession): Promise<void>;

  abstract deleteManyHosts(
    hostIds: UUID[],
    transaction?: ClientSession,
  ): Promise<void>;
}
