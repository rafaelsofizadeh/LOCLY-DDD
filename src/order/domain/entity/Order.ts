import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsISO31661Alpha3,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { EntityProps } from '../../../common/domain/Entity';
import { Address } from './Address';
import { Item } from './Item';
import { Customer } from './Customer';
import { Validatable } from '../../../common/domain/Validatable';
import { ShipmentCostCalculator } from '../../application/port/ShipmentCostCalculator';
import { EntityId } from '../../../common/domain/EntityId';
import { Identifiable } from '../../../common/domain/Identifiable';
import { Host } from './Host';
import { HostMatcher } from '../../application/port/HostMatcher';

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
  @Type(() => Customer)
  customer: Customer;

  // TODO(NOW): Condition 'optional' on order's status (or find a better way)
  @IsOptional()
  @ValidateNested()
  @Type(() => Host)
  host?: Host;

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
  @IsISO31661Alpha3()
  @ValidateNested()
  @Type(() => Address)
  destination: Address;

  @IsOptional()
  @IsNumber()
  shipmentCost?: ShipmentCost;
}

export class Order extends Identifiable(Validatable(OrderProps)) {

  constructor(
    {
      id,
      status,
      customer,
      items,
      originCountry,
      destination,
      shipmentCost,
    }: OrderProps = new OrderProps(),
  ) {
    super();

    this.id = id || new EntityId();
    this.updateStatus(status);
    this.items = items;
    this.customer = customer;
    this.originCountry = originCountry;
    this.destination = destination;
    this.shipmentCost = shipmentCost;
  }

  updateStatus(newStatus?: OrderStatus): OrderStatus {
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

  async calculateShipmentCost(
    calculator: ShipmentCostCalculator,
  ): Promise<void> {
    const shipmentCost: ShipmentCost = await calculator.getRate({
      originCountry: this.originCountry,
      destinationCountry: this.destination.country,
      packages: this.items.map(({ physicalCharacteristics }) => ({
        ...physicalCharacteristics,
      })),
    });

    this.shipmentCost = shipmentCost;
  }

  async matchHost(hostMatcher: HostMatcher): Promise<void> {
    const host: Host = await hostMatcher.matchHost(this.originCountry);

    this.host = host;
  }
}
