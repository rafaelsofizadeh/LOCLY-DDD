import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsISO31661Alpha3,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

import { EntityProps } from '../../../common/domain/Entity';
import { EntityId } from '../../../common/domain/EntityId';
import { Validatable } from '../../../common/domain/Validatable';
import { Serializable } from '../../../common/domain/Serializable';
import { Identifiable } from '../../../common/domain/Identifiable';
import { EntityIdToStringId } from '../../../common/types';

import { Item, ItemProps } from './Item';
import { Host } from './Host';
import { Address, AddressProps } from './Address';
import { ShipmentCostRequest } from '../../application/port/ShipmentCostCalculator';
import { TransformEntityIdToString } from '../../../common/utils';

export type ShipmentCost = {
  amount: number;
  currency: string;
};

export const OrderStatus = {
  Drafted: 'drafted',
  Confirmed: 'confirmed',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export class OrderProps extends EntityProps {
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ValidateNested()
  @Type(() => EntityId)
  @TransformEntityIdToString()
  customerId: EntityId;

  // TODO(NOW): Condition 'optional' on order's status (or find a better way)
  // TODO: A better way to handle optional properties (maybe through multiple classes)
  @IsOptional()
  @ValidateNested()
  @Type(() => EntityId)
  @TransformEntityIdToString()
  hostId?: EntityId;

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => Item)
  items: Item[];

  @IsISO31661Alpha3()
  originCountry: string;

  // Why not just use a destination() getter, that will get the destination country from the Customer?
  // A problem arises if, after Order's submission, the Customer updates their "selectedAddress" field.
  // Upon getting the Order from persistence (and, together with it, the Order's Customer),
  // the destination will be updated accordingly, which SHOULDN'T happen.
  // So we have to save the relevant bits of Customer's state at the time of Order submission.
  @ValidateNested()
  @Type(() => Address)
  destination: Address;

  @IsOptional()
  @IsNumber()
  shipmentCost?: ShipmentCost;
}

export type OrderPropsPlain = Omit<
  EntityIdToStringId<Required<OrderProps>>,
  'customerId' | 'hostId' | 'items' | 'destination'
> & {
  customerId: string;
  hostId?: string;
  items: ItemProps[];
  destination: AddressProps;
};

// TODO(IMPORTANT)(GLOBAL): assert that all optional properties in <SomeClassProps> are initialized.
// After: get rid of Required<SomeClassProps> in <SomeClassPropsPlain>
export class Order extends Identifiable(
  Validatable(Serializable<OrderPropsPlain, typeof OrderProps>(OrderProps)),
) {
  constructor(
    {
      id = new EntityId(),
      status,
      customerId,
      hostId,
      items,
      originCountry,
      destination,
      shipmentCost,
    }: OrderProps = new OrderProps(), // default value is needed for class-validator plainToClass
    // Why? plainToClass calls the constructors without any input data, which, together with destructuring, leads to an error.
  ) {
    super();

    this.id = id;
    this.customerId = customerId;
    // TODO: Better way to handle optional properties
    this.hostId = hostId;
    this.items = items;
    this.originCountry = originCountry;
    this.destination = destination;
    this.shipmentCost = shipmentCost;

    // TODO: Better way to handle optional properties
    this.updateStatus(status);
  }

  // TODO: Persist Customer to Order more explicitly maybe?
  async draft(
    getShipmentCostRate: (
      costRequest: ShipmentCostRequest,
    ) => Promise<ShipmentCost>,
    persistAddOrder: (order: Order) => Promise<void>,
  ): Promise<void> {
    // TODO: Do I need validation here?
    await this.validate();
    this.shipmentCost = await this.calculateShipmentCost(getShipmentCostRate);

    await persistAddOrder(this);
  }

  async confirm(
    host: Host,
    persistAddHostToOrder: (order: Order, host: Host) => Promise<void>,
  ): Promise<void> {
    this.hostId = host.id;
    this.status = OrderStatus.Confirmed;

    await persistAddHostToOrder(this, host);
  }

  private updateStatus(newStatus?: OrderStatus): OrderStatus {
    if (newStatus) {
      this.status = newStatus;
      return this.status;
    }

    const statusTuples = Object.entries(OrderStatus);
    const currentStatusIndex: number = statusTuples.findIndex(
      ([_, status]: [string, OrderStatus]) => this.status === status,
    );
    const nextStatus: OrderStatus = statusTuples[currentStatusIndex + 1][1];

    this.status = nextStatus;
    return this.status;
  }

  private async calculateShipmentCost(
    getShipmentCostRate: (
      costRequest: ShipmentCostRequest,
    ) => Promise<ShipmentCost>,
  ): Promise<ShipmentCost> {
    const shipmentCost: ShipmentCost = await getShipmentCostRate({
      originCountry: this.originCountry,
      destinationCountry: this.destination.country,
      packages: this.items.map(({ physicalCharacteristics }) => ({
        ...physicalCharacteristics,
      })),
    });

    return shipmentCost;
  }
}
