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

  @IsOptional()
  @IsNumber()
  shipmentCost?: ShipmentCost;
}

export class Order extends Identifiable(Validatable(OrderProps)) {
  get destination(): Address {
    return this.customer.selectedAddress;
  }

  constructor(
    {
      id,
      status,
      customer,
      items,
      originCountry,
      shipmentCost,
    }: OrderProps = new OrderProps(),
  ) {
    super();

    this.id = id || new EntityId();
    this.items = items;
    this.customer = customer;
    this.shipmentCost = shipmentCost;
    this.originCountry = originCountry;
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
}
