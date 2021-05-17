import { UseCase } from '../../../common/application';
import { IsUUID, UUID } from '../../../common/domain';
import { UnidCustomerOrderRequest } from '../../entity/Order';

export interface DeleteOrderPayload {
  orderId: UUID;
  customerId: UUID;
}

export class DeleteOrderRequest
  implements UnidCustomerOrderRequest<DeleteOrderPayload> {
  @IsUUID()
  readonly orderId: UUID;
}

export type DeleteOrderResult = void;

export abstract class IDeleteOrder extends UseCase<
  DeleteOrderPayload,
  DeleteOrderResult
> {}
