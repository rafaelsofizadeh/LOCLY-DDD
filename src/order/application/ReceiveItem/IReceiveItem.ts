import { UseCase } from '../../../common/application';
import { IsUUID, UUID } from '../../../common/domain';
import { UnidHostRequest } from '../../../host/entity/Host';

export interface ReceiveItemPayload
  extends Readonly<{
    orderId: UUID;
    hostId: UUID;
    itemId: UUID;
  }> {}

export class ReceiveItemRequest implements UnidHostRequest<ReceiveItemPayload> {
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
