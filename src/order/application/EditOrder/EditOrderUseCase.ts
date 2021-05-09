import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { DraftedOrder } from '../../entity/Order';
import { DraftOrderRequest } from '../DraftOrder/IDraftOrder';

export interface EditOrderRequest extends DraftOrderRequest {
  orderId: UUID;
}

export abstract class EditOrderUseCase extends UseCase<
  EditOrderRequest,
  DraftedOrder
> {}
