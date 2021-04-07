import { EntityProps } from '../../../common/domain/Entity';
import { EntityId } from '../../../common/domain/EntityId';
import { EntityIdsToStringIds } from '../../../common/types';
import { Country } from '../data/Country';
import { OrderStatus } from './Order';
import { ReceivedByHostOrder } from './ReceivedByHostOrder';

export interface ConfirmedOrderProps extends EntityProps {
  status: OrderStatus;
  originCountry: Country;
  hostId: EntityId;
}

export type ConfirmedOrderPropsPlain = EntityIdsToStringIds<
  ConfirmedOrderProps
>;

export class ConfirmedOrder implements ConfirmedOrderProps {
  readonly id: EntityId;

  readonly status: OrderStatus = OrderStatus.Confirmed;

  readonly originCountry: Country;

  readonly hostId: EntityId;

  constructor({
    id,
    originCountry,
    hostId,
  }: Omit<ConfirmedOrderProps, 'status'>) {
    this.id = id;
    this.originCountry = originCountry;
    this.hostId = hostId;
  }

  // TODO: Should I add a "create" alias method for the constructor?

  toReceivedByHost() {
    return ReceivedByHostOrder.create(this);
  }

  serialize(): ConfirmedOrderPropsPlain {
    return {
      id: this.id.value,
      status: this.status,
      originCountry: this.originCountry,
      hostId: this.hostId.value,
    };
  }
}
