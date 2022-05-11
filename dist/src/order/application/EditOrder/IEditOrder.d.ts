import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { DraftedOrder } from '../../entity/Order';
import { UnidCustomerRequest } from '../../../customer/entity/Customer';
import { DraftOrderPayload, DraftOrderRequest } from '../DraftOrder/IDraftOrder';
export interface EditOrderPayload extends DraftOrderPayload {
    orderId: UUID;
}
export declare class EditOrderRequest extends DraftOrderRequest implements UnidCustomerRequest<EditOrderPayload> {
    readonly orderId: UUID;
}
export declare abstract class IEditOrder extends UseCase<EditOrderPayload, DraftedOrder> {
}
