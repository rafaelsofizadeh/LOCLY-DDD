import { EntityProps } from '../../../common/domain/Entity';
import { EntityId } from '../../../common/domain/EntityId';
import { EntityIdsToStringIds } from '../../../common/types';
import { OrderStatus } from './Order';

export interface ReceivedByHostOrderProps extends EntityProps {
  status: OrderStatus;
  receivedByHostDate: Date;
}

export type ReceivedByHostOrderPropsPlain = EntityIdsToStringIds<
  ReceivedByHostOrderProps
>;

export class ReceivedByHostOrder implements ReceivedByHostOrderProps {
  readonly id: EntityId;

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
      id: this.id.value,
      status: this.status,
      receivedByHostDate: this.receivedByHostDate,
    };
  }
}
