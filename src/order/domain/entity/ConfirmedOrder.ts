import { Type } from 'class-transformer';
import { EntityProps } from '../../../common/domain/Entity';
import { EntityId } from '../../../common/domain/EntityId';
import { EntityIdsToStringIds } from '../../../common/types';
import { Country } from '../data/Country';
import { Host } from './Host';
import { OrderStatus } from './Order';
import { ReceivedByHostOrder } from './ReceivedByHostOrder';

export class ConfirmedOrderProps extends EntityProps {
  // TODO: when to set status?
  status: OrderStatus = 'confirmed';

  originCountry: Country;

  @Type(() => EntityId)
  hostId?: EntityId;
}

export type ConfirmedOrderPropsPlain = Omit<
  EntityIdsToStringIds<ConfirmedOrderProps>,
  'hostId'
> & {
  hostId: string;
};

export class ConfirmedOrder extends ConfirmedOrderProps {
  constructor(
    {
      id = new EntityId(),
      originCountry,
    }: // default value is needed for class-validator plainToClass. Refer to: Order.ts.
    Omit<ConfirmedOrderProps, 'status'> = new ConfirmedOrderProps(),
  ) {
    super();

    this.status = OrderStatus.Confirmed;

    this.id = id;
    this.originCountry = originCountry;
  }

  initialize(host: Host) {
    this.hostId = host.id;
    this.status = OrderStatus.Confirmed;
  }

  toReceivedByHost() {
    return new ReceivedByHostOrder(this);
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
