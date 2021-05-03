import { UUID } from '../../../common/domain';
import { Country } from '../data/Country';

export interface ConfirmOrderProps {
  id: UUID;
  originCountry: Country;
  hostId: UUID;
}

export class ConfirmOrder implements ConfirmOrderProps {
  readonly id: UUID;

  readonly originCountry: Country;

  readonly hostId: UUID;

  private constructor({ id, originCountry, hostId }: ConfirmOrderProps) {
    this.id = id;
    this.originCountry = originCountry;
    this.hostId = hostId;
  }

  static fromData(payload: ConfirmOrderProps) {
    return new this(payload);
  }

  static async confirm(
    orderId: UUID,
    hostId: UUID,
    persistConfirmationFn: (
      toConfirmOrderId: UUID,
      confirmedHostId: UUID,
    ) => Promise<unknown>,
    addOrderToHostFn: (
      toAddOrderToHostId: UUID,
      toAddOrderId: UUID,
    ) => Promise<unknown>,
  ): Promise<void> {
    await persistConfirmationFn(orderId, hostId);
    await addOrderToHostFn(hostId, orderId);
  }
}
