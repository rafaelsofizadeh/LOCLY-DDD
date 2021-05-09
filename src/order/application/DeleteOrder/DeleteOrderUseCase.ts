import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';

export interface DeleteOrderRequest {
  orderId: UUID;
  customerId: UUID;
}

export type DeleteOrderResult = void;

export abstract class DeleteOrderUseCase extends UseCase<
  DeleteOrderRequest,
  DeleteOrderResult
> {}
