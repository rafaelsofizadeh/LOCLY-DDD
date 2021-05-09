import { UseCase } from '../../../../../common/application';
import { UUID } from '../../../../../common/domain';

export interface PayShipmentHandlerRequest {
  orderId: UUID;
}

export type PayShipmentHandlerResult = void;

export abstract class IPayShipmentHandler extends UseCase<
  PayShipmentHandlerRequest,
  PayShipmentHandlerResult
> {}
