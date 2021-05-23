import { UseCase } from '../../../../../common/application';
import { UUID } from '../../../../../common/domain';

export type PayShipmentWebhookPayload = {
  orderId: UUID;
};

export type PayShipmentWebhookResult = void;

export abstract class IPayShipmentHandler extends UseCase<
  PayShipmentWebhookPayload,
  PayShipmentWebhookResult
> {}
