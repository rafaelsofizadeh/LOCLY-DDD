import { UserType } from '../../../auth/entity/Token';
import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
export declare const maxSimulataneousPhotoCount = 4;
export declare const maxPhotoSizeBytes = 7000000;
export declare type GetItemPhotoPayload = {
    userId: UUID;
    userType: UserType;
    orderId: UUID;
    itemId: UUID;
    photoId: UUID;
};
export declare type GetItemPhotoResult = {
    fileName: string;
    contentType: string;
    uploadDate: Date;
    data: string;
};
export declare class GetItemPhotoRequest implements Omit<GetItemPhotoPayload, 'userId' | 'userType'> {
    readonly orderId: UUID;
    readonly itemId: UUID;
    readonly photoId: UUID;
}
export declare abstract class IGetItemPhoto extends UseCase<GetItemPhotoPayload, GetItemPhotoResult> {
}
