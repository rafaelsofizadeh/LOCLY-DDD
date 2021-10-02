import { UserType } from '../../../auth/entity/Token';
import { UseCase } from '../../../common/application';
import { IsUUID, UUID } from '../../../common/domain';

export const maxSimulataneousPhotoCount = 4;

export const maxPhotoSizeBytes = 7000000;

export type GetItemPhotoPayload = {
  userId: UUID;
  userType: UserType;
  orderId: UUID;
  itemId: UUID;
  photoId: UUID;
};

export type GetItemPhotoResult = {
  fileName: string;
  contentType: string;
  uploadDate: Date;
  data: string;
};

export class GetItemPhotoRequest
  implements Omit<GetItemPhotoPayload, 'userId' | 'userType'> {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly itemId: UUID;

  @IsUUID()
  readonly photoId: UUID;
}

export abstract class IGetItemPhoto extends UseCase<
  GetItemPhotoPayload,
  GetItemPhotoResult
> {}
