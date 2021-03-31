import { Type } from 'class-transformer';
import { EntityProps } from '../../../common/domain/Entity';
import { EntityId } from '../../../common/domain/EntityId';
import { EntityIdsToStringIds } from '../../../common/types';
import { Country } from '../data/Country';
import { Host } from './Host';
import { OrderStatus } from './Order';

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
    Omit<ConfirmedOrderProps, 'status' | 'hostId'> = new ConfirmedOrderProps(),
  ) {
    super();

    this.id = id;
    // TODO: when to set status?
    this.status = OrderStatus.Confirmed;
    this.originCountry = originCountry;
  }

  async confirm(host: Host): Promise<void> {
    this.hostId = host.id;
    this.status = OrderStatus.Confirmed;
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
