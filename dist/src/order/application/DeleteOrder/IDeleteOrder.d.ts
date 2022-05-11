import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { UnidCustomerRequest } from '../../../customer/entity/Customer';
export interface DeleteOrderPayload {
    orderId: UUID;
    customerId: UUID;
}
export declare class DeleteOrderRequest implements UnidCustomerRequest<DeleteOrderPayload> {
    readonly orderId: UUID;
}
export declare type DeleteOrderResult = void;
export declare abstract class IDeleteOrder extends UseCase<DeleteOrderPayload, DeleteOrderResult> {
}
