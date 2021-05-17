import { UseCase } from '../../../common/application';
import { IsUUID, UUID } from '../../../common/domain';
import { DraftedOrder, UnidCustomerOrderRequest } from '../../entity/Order';
import {
  DraftOrderPayload,
  DraftOrderRequest,
} from '../DraftOrder/IDraftOrder';

export interface EditOrderPayload extends DraftOrderPayload {
  orderId: UUID;
}

export class EditOrderRequest extends DraftOrderRequest
  implements UnidCustomerOrderRequest<EditOrderPayload> {
  @IsUUID()
  readonly orderId: UUID;
}

export abstract class IEditOrder extends UseCase<
  EditOrderPayload,
  DraftedOrder
> {}
