import { UUID } from '../../../common/domain/UUID';
import { PhysicalItemProps } from '../entity/Item';
import { VerifiedByHostOrder } from '../entity/VerifiedByHostOrder';

export interface HostEditOrderRequest {
  orderId: UUID;
  physicalItems: PhysicalItemProps[];
}

export abstract class VerifiedByHostOrderUseCase {
  abstract execute(port: HostEditOrderRequest): Promise<VerifiedByHostOrder>;
}
