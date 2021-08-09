import { UseCase } from '../../../common/application';
import { IsUUID, UUID } from '../../../common/domain';
import { UnidHostRequest } from '../../../host/entity/Host';
import {
  FileUpload,
  FileUploadResult,
} from '../../persistence/OrderMongoMapper';

export const maxSimulataneousPhotoCount = 4;

export const maxPhotoSizeBytes = 7000000;

export interface AddItemPhotoPayload {
  orderId: UUID;
  hostId: UUID;
  itemId: UUID;
  photos: FileUpload[];
}

export class AddItemPhotoRequest
  implements Omit<UnidHostRequest<AddItemPhotoPayload>, 'photos'> {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly itemId: UUID;
}

export abstract class IAddItemPhotos extends UseCase<
  AddItemPhotoPayload,
  AddItemPhotosResult
> {}

export type AddItemPhotosResult = FileUploadResult[];
