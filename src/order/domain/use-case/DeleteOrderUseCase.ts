import { UUID } from '../../../common/domain';
import { UseCase } from '../../../common/domain';

export interface DeleteOrderRequest {
  orderId: UUID;
  customerId: UUID;
}

export abstract class DeleteOrderUseCase extends UseCase<
  DeleteOrderRequest,
  void
> {}
