import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { UnidHostRequest } from '../../../host/entity/Host';
import { FileUpload, FileUploadResult } from '../../persistence/OrderMongoMapper';
export declare const maxSimulataneousPhotoCount = 4;
export declare const maxPhotoSizeBytes = 7000000;
export interface AddItemPhotoPayload {
    orderId: UUID;
    hostId: UUID;
    itemId: UUID;
    photos: FileUpload[];
}
export declare class AddItemPhotoRequest implements Omit<UnidHostRequest<AddItemPhotoPayload>, 'photos'> {
    readonly orderId: UUID;
    readonly itemId: UUID;
}
export declare abstract class IAddItemPhotos extends UseCase<AddItemPhotoPayload, AddItemPhotosResult> {
}
export declare type AddItemPhotosResult = FileUploadResult[];
