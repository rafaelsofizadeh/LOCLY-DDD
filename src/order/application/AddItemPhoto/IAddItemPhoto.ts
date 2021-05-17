import { UseCase } from '../../../common/application';
import { IsUUID, UUID } from '../../../common/domain';
import { UnidHostOrderRequest } from '../../entity/Order';
import { Photo } from '../../persistence/OrderMongoMapper';

export const maxSimulataneousPhotoCount = 4;

export const maxPhotoSizeBytes = 7000000;

export interface AddItemPhotoPayload {
  orderId: UUID;
  hostId: UUID;
  itemId: UUID;
  photos: Photo[];
}

export class AddItemPhotoRequest
  implements Omit<UnidHostOrderRequest<AddItemPhotoPayload>, 'photos'> {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly itemId: UUID;
}

export abstract class IAddItemPhoto extends UseCase<
  AddItemPhotoPayload,
  ItemPhotosUploadResult
> {}

export type ItemPhotosUploadResult = Array<{ photoName: string; id: UUID }>;
