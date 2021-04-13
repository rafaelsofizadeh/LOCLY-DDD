import { UUID } from '../../../common/domain/UUID';
import { OrderStatus } from './Order';

export interface ReceivedByHostOrderProps {
  id: UUID;
  status: OrderStatus;
  receivedByHostDate: Date;
}

export type ReceivedByHostOrderPropsPlain = ReceivedByHostOrderProps;

export class ReceivedByHostOrder implements ReceivedByHostOrderProps {
  readonly id: UUID;

  readonly status: OrderStatus = OrderStatus.ReceivedByHost;

  readonly receivedByHostDate: Date;

  constructor({
    id,
    receivedByHostDate,
  }: Omit<ReceivedByHostOrderProps, 'status'>) {
    this.id = id;
    this.status = OrderStatus.ReceivedByHost;
    this.receivedByHostDate = receivedByHostDate;
  }

  static create({ id }: Pick<ReceivedByHostOrder, 'id'>): ReceivedByHostOrder {
    const receivedByHostOrder: ReceivedByHostOrder = new this({
      id,
      receivedByHostDate: new Date(),
    });

    return receivedByHostOrder;
  }

  serialize(): ReceivedByHostOrderPropsPlain {
    return {
      id: this.id,
      status: this.status,
      receivedByHostDate: this.receivedByHostDate,
    };
  }
}
