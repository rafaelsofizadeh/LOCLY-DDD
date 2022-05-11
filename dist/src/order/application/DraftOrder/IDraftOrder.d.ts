import { Country } from '../../entity/Country';
import { Gram } from '../../entity/Item';
import { UseCase } from '../../../common/application';
import { Address, UUID, WithoutId } from '../../../common/domain';
import { DraftedItem } from '../../entity/Item';
import { DraftedOrder } from '../../entity/Order';
import { UnidCustomerRequest } from '../../../customer/entity/Customer';
interface DraftItemRequest extends WithoutId<DraftedItem> {
}
export interface DraftOrderPayload extends Pick<DraftedOrder, 'customerId' | 'originCountry' | 'destination'> {
    readonly orderId?: UUID;
    readonly items: DraftItemRequest[];
}
declare class DraftItemRequestSchema implements DraftItemRequest {
    title: string;
    url?: string;
    weight: Gram;
}
export declare class DraftOrderRequest implements Omit<UnidCustomerRequest<DraftOrderPayload>, 'orderId'> {
    readonly originCountry: Country;
    readonly destination: Address;
    readonly items: DraftItemRequestSchema[];
}
export declare abstract class IDraftOrder extends UseCase<DraftOrderPayload, DraftedOrder> {
}
export {};
