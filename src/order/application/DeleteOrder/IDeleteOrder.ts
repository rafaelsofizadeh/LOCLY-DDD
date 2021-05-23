import { UseCase } from '../../../common/application';
import { IsUUID, UUID } from '../../../common/domain';
import { UnidCustomerRequest } from '../../../customer/entity/Customer';

export interface DeleteOrderPayload {
  orderId: UUID;
  customerId: UUID;
}

export class DeleteOrderRequest
  implements UnidCustomerRequest<DeleteOrderPayload> {
  @IsUUID()
  readonly orderId: UUID;
}

export type DeleteOrderResult = void;

export abstract class IDeleteOrder extends UseCase<
  DeleteOrderPayload,
  DeleteOrderResult
> {}
