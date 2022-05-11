import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Gram } from '../../entity/Item';
import { Cost as ICost } from '../../entity/Order';
import { UnidHostRequest } from '../../../host/entity/Host';
import { FileUpload, FileUploadResult } from '../../persistence/OrderMongoMapper';
import { Currency } from '../../entity/Currency';
export declare type URL = string;
export interface SubmitShipmentInfoPayload extends Readonly<{
    orderId: UUID;
    hostId: UUID;
    totalWeight: Gram;
    shipmentCost: Cost;
    calculatorResultUrl?: URL;
    trackingNumber?: string;
    deliveryEstimateDays?: number;
    proofOfPayment: FileUpload;
}> {
}
declare class Cost implements ICost {
    amount: number;
    currency: Currency;
}
export declare class SubmitShipmentInfoRequest implements Omit<UnidHostRequest<SubmitShipmentInfoPayload>, 'proofOfPayment'> {
    readonly orderId: UUID;
    readonly totalWeight: Gram;
    readonly shipmentCost: Cost;
    readonly calculatorResultUrl?: URL;
    readonly trackingNumber?: string;
    readonly deliveryEstimateDays?: number;
}
export declare type SubmitShipmentInfoResult = FileUploadResult;
export declare abstract class ISubmitShipmentInfo extends UseCase<SubmitShipmentInfoPayload, SubmitShipmentInfoResult> {
}
export {};
