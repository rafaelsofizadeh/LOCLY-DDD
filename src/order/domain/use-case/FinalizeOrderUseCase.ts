import { UseCase } from '../../../common/domain';
import { UUID } from '../../../common/domain';
import { Gram } from '../entity/Item';
import { Cost } from '../entity/Order';

export type URL = string;

export interface FinalizeOrderRequest {
  orderId: UUID;
  hostId: UUID;
  totalWeight: Gram;
  deliveryCost: Cost;
  calculatorResultUrl?: URL;
}

export abstract class FinalizeOrderUseCase extends UseCase<
  FinalizeOrderRequest,
  void
> {}
