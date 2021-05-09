import { UseCase } from '../../../common/application';
import { IsUUID, UUID } from '../../../common/domain';
import { DraftedOrder } from '../../entity/Order';
import { DraftOrderRequest } from '../DraftOrder/IDraftOrder';

export interface EditOrderRequest extends DraftOrderRequest {
  orderId: UUID;
}

export class EditOrderRequestAdapter extends DraftOrderRequest
  implements EditOrderRequest {
  @IsUUID()
  readonly orderId: UUID;
}

export abstract class IEditOrder extends UseCase<
  EditOrderRequest,
  DraftedOrder
> {}
