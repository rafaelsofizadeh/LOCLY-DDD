import { UUID } from '../../../common/domain/UUID';
import { Country } from '../data/Country';
import { DraftedOrder } from './DraftedOrder';
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

  async create({ id, originCountry }: DraftedOrder) {}

  toReceivedByHost() {
    return ReceivedByHostOrder.create(this);
  }

  serialize(): ConfirmedOrderPropsPlain {
    return {
      id: this.id,
      originCountry: this.originCountry,
      hostId: this.hostId,
    };
  }
}
