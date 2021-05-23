import { UseCase } from '../../../common/application';
import { IsUUID, UUID } from '../../../common/domain';
import { DraftedOrder } from '../../entity/Order';
import { UnidCustomerRequest } from '../../../customer/entity/Customer';
import {
  DraftOrderPayload,
  DraftOrderRequest,
} from '../DraftOrder/IDraftOrder';

export interface EditOrderPayload extends DraftOrderPayload {
  orderId: UUID;
}

export class EditOrderRequest extends DraftOrderRequest
  implements UnidCustomerRequest<EditOrderPayload> {
  @IsUUID()
  readonly orderId: UUID;
}

export abstract class IEditOrder extends UseCase<
  EditOrderPayload,
  DraftedOrder
> {}
