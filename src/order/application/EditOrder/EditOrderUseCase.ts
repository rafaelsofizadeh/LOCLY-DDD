import { UUID } from '../../../common/domain';
import { DraftedOrder } from '../../entity/Order';
import { UseCase } from '../../../common/domain';
import { DraftOrderRequest } from '../DraftOrder/DraftOrderUseCase';

export interface EditOrderRequest extends DraftOrderRequest {
  orderId: UUID;
}

export abstract class EditOrderUseCase extends UseCase<
  EditOrderRequest,
  DraftedOrder
> {}
