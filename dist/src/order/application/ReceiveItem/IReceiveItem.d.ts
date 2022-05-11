import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { UnidHostRequest } from '../../../host/entity/Host';
export interface ReceiveItemPayload extends Readonly<{
    orderId: UUID;
    hostId: UUID;
    itemId: UUID;
}> {
}
export declare class ReceiveItemRequest implements UnidHostRequest<ReceiveItemPayload> {
    readonly orderId: UUID;
    readonly itemId: UUID;
}
export interface ReceiveItemResult {
    readonly receivedDate: Date;
}
export declare abstract class IReceiveItem extends UseCase<ReceiveItemPayload, ReceiveItemResult> {
}
