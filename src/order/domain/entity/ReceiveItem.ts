import { EntityFilter, UUID } from '../../../common/domain';

export type ReceiveItemProps = {
  id: UUID;
  receivedDate: Date;
};

export class ReceiveItem implements ReceiveItemProps {
  readonly id: UUID;

  readonly receivedDate: Date;

  private constructor({ id, receivedDate }: ReceiveItemProps) {
    this.id = id;
    this.receivedDate = receivedDate;
  }

  static fromData(payload: ReceiveItemProps) {
    return new this(payload);
  }
}
