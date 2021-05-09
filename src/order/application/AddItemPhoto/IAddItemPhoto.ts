import { UseCase } from '../../../common/application';
import { IsUUID, UUID } from '../../../common/domain';
import { Photo } from '../../persistence/OrderMongoMapper';

export const photoPropertyName = 'photos';

export const maxSimulataneousPhotoCount = 4;

export const maxPhotoSizeBytes = 7000000;

export interface AddItemPhotoRequestBody {
  orderId: UUID;
  hostId: UUID;
  itemId: UUID;
}

export interface AddItemPhotoRequest extends AddItemPhotoRequestBody {
  [photoPropertyName]: Photo[];
}

export class AddItemPhotoRequestBodyAdapter
  implements AddItemPhotoRequestBody {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly hostId: UUID;

  @IsUUID()
  readonly itemId: UUID;
}

export abstract class AddItemPhotoUseCase extends UseCase<
  AddItemPhotoRequest,
  ItemPhotosUploadResult
> {}

export type ItemPhotosUploadResult = Array<{ photoName: string; id: UUID }>;
