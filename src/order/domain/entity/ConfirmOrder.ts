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
}
