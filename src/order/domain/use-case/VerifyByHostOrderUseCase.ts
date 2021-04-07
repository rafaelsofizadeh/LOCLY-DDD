import { EntityId } from '../../../common/domain/EntityId';
import { PhysicalItem } from '../entity/PhysicalItem';
import { VerifiedByHostOrder } from '../entity/VerifiedByHostOrder';

export interface HostEditOrderRequest {
  orderId: EntityId;
  physicalItems: PhysicalItem[];
}

export abstract class VerifiedByHostOrderUseCase {
  abstract execute(port: HostEditOrderRequest): Promise<VerifiedByHostOrder>;
}
