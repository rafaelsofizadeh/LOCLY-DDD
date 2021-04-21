import { UUID } from '../../../common/domain/UUID';

export interface ReceivedByHostOrderProps {
  id: UUID;
  receivedByHostDate: Date;
}

export class ReceivedByHostOrder implements ReceivedByHostOrderProps {
  readonly id: UUID;

  readonly receivedByHostDate: Date;

  private constructor({ id, receivedByHostDate }: ReceivedByHostOrderProps) {
    this.id = id;
    this.receivedByHostDate = receivedByHostDate;
  }

  static fromData(payload: ReceivedByHostOrderProps) {
    return new this(payload);
  }

  static create({ id }: Pick<ReceivedByHostOrder, 'id'>): ReceivedByHostOrder {
    const receivedByHostOrder: ReceivedByHostOrder = new this({
      id,
      receivedByHostDate: new Date(),
    });

    return receivedByHostOrder;
  }
}
