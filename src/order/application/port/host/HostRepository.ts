import { ClientSession } from 'mongodb';
import { UUID } from '../../../../common/domain/UUID';
import { Country } from '../../../domain/data/Country';
import { Host } from '../../../domain/entity/Host';

export abstract class HostRepository {
  // This should always be used together with OrderRepository.addHostToOrder
  abstract addOrderToHost(
    hostId: UUID,
    orderId: UUID,
    transaction?: ClientSession,
  ): Promise<void>;

  abstract findHost(hostId: UUID, transaction?: ClientSession): Promise<Host>;

  abstract findHostAvailableInCountryWithMinimumNumberOfOrders(
    country: Country,
    transaction?: ClientSession,
  ): Promise<Host>;
}
