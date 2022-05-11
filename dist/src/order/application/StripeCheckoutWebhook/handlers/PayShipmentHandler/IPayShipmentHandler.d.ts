import { UseCase } from '../../../../../common/application';
import { UUID } from '../../../../../common/domain';
export declare type PayShipmentWebhookPayload = {
    orderId: UUID;
};
export declare type PayShipmentWebhookResult = void;
export declare abstract class IPayShipmentHandler extends UseCase<PayShipmentWebhookPayload, PayShipmentWebhookResult> {
}
