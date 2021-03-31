import { EntityProps } from '../../../common/domain/Entity';
import { EntityId } from '../../../common/domain/EntityId';
import { EntityIdsToStringIds } from '../../../common/types';
import { OrderStatus } from './Order';

export class ReceivedByHostOrderProps extends EntityProps {
  status: OrderStatus = 'host_received';
  receivedByHostDate?: Date;
}

export type ReceivedByHostOrderPropsPlain = EntityIdsToStringIds<
  ReceivedByHostOrderProps
>;

export class ReceivedByHostOrder extends ReceivedByHostOrderProps {
  constructor(
    {
      id = new EntityId(),
    }: // default value is needed for class-validator plainToClass. Refer to: Order.ts.
    Omit<ReceivedByHostOrderProps, 'status'> = new ReceivedByHostOrderProps(),
  ) {
    super();

    this.status = OrderStatus.ReceivedByHost;

    this.id = id;
  }

  initialize() {
    this.receivedByHostDate = new Date();
    this.status = OrderStatus.ReceivedByHost;
  }

  serialize(): ReceivedByHostOrderPropsPlain {
    return {
      id: this.id.value,
      status: this.status,
      receivedByHostDate: this.receivedByHostDate,
    };
  }
}
