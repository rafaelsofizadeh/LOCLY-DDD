import { UUID } from '../../../common/domain/UUID';
import { PhysicalItem } from '../entity/PhysicalItem';
import { VerifiedByHostOrder } from '../entity/VerifiedByHostOrder';

export interface HostEditOrderRequest {
  orderId: UUID;
  physicalItems: PhysicalItem[];
}

export abstract class VerifiedByHostOrderUseCase {
  abstract execute(port: HostEditOrderRequest): Promise<VerifiedByHostOrder>;
}
