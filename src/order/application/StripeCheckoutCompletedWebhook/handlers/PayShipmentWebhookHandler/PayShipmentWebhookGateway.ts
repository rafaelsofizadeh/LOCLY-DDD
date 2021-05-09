import { UseCase } from '../../../../../common/application';
import { UUID } from '../../../../../common/domain';

export interface PayShipmentRequest {
  orderId: UUID;
}

export type PayShipmentResult = void;

export abstract class PayShipmentWebhookGateway extends UseCase<
  PayShipmentRequest,
  PayShipmentResult
> {}
