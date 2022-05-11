import { StripeCheckoutSessionResult, UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { UnidCustomerRequest } from '../../../customer/entity/Customer';
export declare type ConfirmOrderPayload = Readonly<{
    orderId: UUID;
    customerId: UUID;
    balanceDiscountUsdCents: number;
}>;
export declare class ConfirmOrderRequest implements UnidCustomerRequest<ConfirmOrderPayload> {
    readonly orderId: UUID;
    readonly balanceDiscountUsdCents: number;
}
export declare type ConfirmOrderResult = StripeCheckoutSessionResult;
export declare abstract class IConfirmOrder extends UseCase<ConfirmOrderPayload, ConfirmOrderResult> {
}
