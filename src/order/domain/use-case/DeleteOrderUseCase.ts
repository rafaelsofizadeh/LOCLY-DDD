import { UUID } from '../../../common/domain/UUID';
import { UseCase } from '../../../common/domain/UseCase';

export interface DeleteOrderRequest {
  orderId: UUID;
  customerId: UUID;
}

export abstract class DeleteOrderUseCase extends UseCase<
  DeleteOrderRequest,
  void
> {}
