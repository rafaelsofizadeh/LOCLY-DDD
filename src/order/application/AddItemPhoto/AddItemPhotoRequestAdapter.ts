import { IsUUID, UUID } from '../../../common/domain';
import { AddItemPhotosRequestBody } from './AddItemPhotoUseCase';

export class AddItemPhotoRequestBodyAdapter
  implements AddItemPhotosRequestBody {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly hostId: UUID;

  @IsUUID()
  readonly itemId: UUID;
}
