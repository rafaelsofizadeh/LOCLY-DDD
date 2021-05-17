import { UseCase } from '../../../common/application';
import { IsUUID, UUID } from '../../../common/domain';
import { UnidHostOrderRequest } from '../../entity/Order';

export interface ReceiveItemPayload
  extends Readonly<{
    orderId: UUID;
    hostId: UUID;
    itemId: UUID;
  }> {}

export class ReceiveItemRequest
  implements UnidHostOrderRequest<ReceiveItemPayload> {
  @IsUUID()
  readonly orderId: UUID;

  @IsUUID()
  readonly itemId: UUID;
}

export interface ReceiveItemResult {
  readonly receivedDate: Date;
}

export abstract class IReceiveItem extends UseCase<
  ReceiveItemPayload,
  ReceiveItemResult
> {}
