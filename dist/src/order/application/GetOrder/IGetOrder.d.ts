import { UserType } from '../../../auth/entity/Token';
import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Order } from '../../entity/Order';
export declare type GetOrderPayload = Readonly<{
    orderId: UUID;
    userId: UUID;
    userType: UserType;
}>;
export declare type GetOrderResult = Readonly<Omit<Order, 'initialShipmentCost' | 'customerId'> | Omit<Order, 'hostId'>>;
export declare abstract class IGetOrder extends UseCase<GetOrderPayload, GetOrderResult> {
}
