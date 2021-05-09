import { UUID } from '../../../common/domain';
import { UseCase } from '../../../common/domain';
import { Photo } from '../../persistence/OrderMongoMapper';

export const photoPropertyName = 'photos';

export const maxSimulataneousPhotoCount = 4;

export const maxPhotoSizeBytes = 7000000;

export interface AddItemPhotosRequestBody {
  orderId: UUID;
  hostId: UUID;
  itemId: UUID;
}

export interface AddItemPhotoRequest extends AddItemPhotosRequestBody {
  [photoPropertyName]: Photo[];
}

export abstract class AddItemPhotoUseCase extends UseCase<
  AddItemPhotoRequest,
  ItemPhotosUploadResult
> {}

export type ItemPhotosUploadResult = Array<{ photoName: string; id: UUID }>;
