import { UUID } from '../../../common/domain/UUID';
import { DraftedOrder } from '../entity/DraftedOrder';
import { UseCase } from '../../../common/domain/UseCase';
import { DraftOrderRequest } from './DraftOrderUseCase';

export interface EditOrderRequest extends DraftOrderRequest {
  orderId: UUID;
}

export abstract class EditOrderUseCase extends UseCase<
  EditOrderRequest,
  DraftedOrder
> {}
