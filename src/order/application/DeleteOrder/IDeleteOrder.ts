import { UseCase } from '../../../common/application';
import { IsUUID, UUID } from '../../../common/domain';

export interface DeleteOrderRequest {
  orderId: UUID;
  customerId: UUID;
}

export class DeleteOrderRequestAdapter implements DeleteOrderRequest {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly customerId: UUID;
}

export type DeleteOrderResult = void;

export abstract class IDeleteOrder extends UseCase<
  DeleteOrderRequest,
  DeleteOrderResult
> {}
