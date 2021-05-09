import { UseCase } from '../../../../../common/application';
import { UUID } from '../../../../../common/domain';

export interface PayOrderShipmentFeeRequest {
  orderId: UUID;
}

export type PayOrderShipmentFeeResult = void;

export abstract class PayOrderShipmentFeeWebhookGateway extends UseCase<
  PayOrderShipmentFeeRequest,
  PayOrderShipmentFeeResult
> {}
