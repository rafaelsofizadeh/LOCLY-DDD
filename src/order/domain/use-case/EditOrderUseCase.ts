import { UUID } from '../../../common/domain';
import { DraftOrder } from '../entity/DraftOrder';
import { UseCase } from '../../../common/domain';
import { DraftOrderRequest } from './DraftOrderUseCase';

export interface EditOrderRequest extends DraftOrderRequest {
  orderId: UUID;
}

export abstract class EditOrderUseCase extends UseCase<
  EditOrderRequest,
  DraftOrder
> {}
