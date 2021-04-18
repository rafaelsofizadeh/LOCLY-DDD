import { UUID } from '../../../common/domain/UUID';
import { Country } from '../data/Country';
import { DraftedOrder } from './DraftedOrder';
import { OrderStatus } from './Order';
import { ReceivedByHostOrder } from './ReceivedByHostOrder';

export interface ConfirmedOrderProps {
  status: OrderStatus;
  id: UUID;
  originCountry: Country;
  hostId: UUID;
}

export type ConfirmedOrderPropsPlain = ConfirmedOrderProps;

export class ConfirmedOrder implements ConfirmedOrderProps {
  readonly id: UUID;

  readonly status: OrderStatus = OrderStatus.Confirmed;

  readonly originCountry: Country;

  readonly hostId: UUID;

  private constructor({
    id,
    originCountry,
    hostId,
  }: Omit<ConfirmedOrderProps, 'status'>) {
    this.id = id;
    this.originCountry = originCountry;
    this.hostId = hostId;
  }

  static fromData(payload: Omit<ConfirmedOrderProps, 'status'>) {
    return new this(payload);
  }

  async create({ id, originCountry }: DraftedOrder) {}

  toReceivedByHost() {
    return ReceivedByHostOrder.create(this);
  }

  serialize(): ConfirmedOrderPropsPlain {
    return {
      id: this.id,
      status: this.status,
      originCountry: this.originCountry,
      hostId: this.hostId,
    };
  }
}
