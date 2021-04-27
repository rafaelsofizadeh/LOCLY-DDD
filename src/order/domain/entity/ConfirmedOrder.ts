import { UUID } from '../../../common/domain';
import { Country } from '../data/Country';
import { ReceivedByHostOrder } from './ReceivedByHostOrder';

export interface ConfirmedOrderProps {
  id: UUID;
  originCountry: Country;
  hostId: UUID;
}

export class ConfirmedOrder implements ConfirmedOrderProps {
  readonly id: UUID;

  readonly originCountry: Country;

  readonly hostId: UUID;

  private constructor({ id, originCountry, hostId }: ConfirmedOrderProps) {
    this.id = id;
    this.originCountry = originCountry;
    this.hostId = hostId;
  }

  static fromData(payload: ConfirmedOrderProps) {
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

  toReceivedByHost() {
    return ReceivedByHostOrder.create(this);
  }
}
