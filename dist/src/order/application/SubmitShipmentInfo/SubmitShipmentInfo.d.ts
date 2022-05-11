import { IOrderRepository } from '../../persistence/IOrderRepository';
import { TransactionUseCasePort } from '../../../common/application';
import { SubmitShipmentInfoPayload, ISubmitShipmentInfo, SubmitShipmentInfoResult } from './ISubmitShipmentInfo';
import { UUID } from '../../../common/domain';
declare enum UnfinalizedItemReason {
    NO_PHOTOS = "no photos",
    NOT_RECEIVED = "not received"
}
export declare type UnfinalizedItem = {
    id: UUID;
    reasons: UnfinalizedItemReason[];
};
export declare class SubmitShipmentInfo implements ISubmitShipmentInfo {
    private readonly orderRepository;
    constructor(orderRepository: IOrderRepository);
    execute({ port: finalizeOrderRequest, mongoTransactionSession, }: TransactionUseCasePort<SubmitShipmentInfoPayload>): Promise<SubmitShipmentInfoResult>;
    private finalizeOrder;
    private getUnfinalizedItems;
}
export {};
