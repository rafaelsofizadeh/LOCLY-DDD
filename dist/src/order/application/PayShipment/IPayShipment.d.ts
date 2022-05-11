import { StripeCheckoutSessionResult, UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { UnidCustomerRequest } from '../../../customer/entity/Customer';
export interface PayShipmentPayload {
    readonly orderId: UUID;
    readonly customerId: UUID;
}
export declare class PayShipmentRequest implements UnidCustomerRequest<PayShipmentPayload> {
    readonly orderId: UUID;
}
export declare type PayShipmentResult = StripeCheckoutSessionResult;
export declare abstract class IPayShipment extends UseCase<PayShipmentPayload, PayShipmentResult> {
}
