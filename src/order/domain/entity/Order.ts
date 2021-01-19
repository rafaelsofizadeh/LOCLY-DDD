import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsISO31661Alpha3,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Address } from './Address';
import { Entity } from '../../../common/domain/Entity';
import { Item } from './Item';
import { Customer } from './Customer';
import { ShipmentCostCalculatorPort } from '../../application/port/ShipmentCostCalculatorPort';
import { Optional } from '../../../common/types';
import { UniqueEntityID } from '../../../common/domain/UniqueEntityId';

export type ShipmentCost = {
  amount: number;
  currency: string;
};

export const OrderStatus = {
  Requested: 'requested',
  Initialized: 'initialized',
  Uninitialized: 'uninitilized',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

type OrderProps = {
  status?: OrderStatus;
  customer: Customer;
  // Non-empty array
  items: Item[];
  originCountry: string;
  shipmentCost?: ShipmentCost;
};

export class Order extends Entity<OrderProps> {
  constructor(
    { status = OrderStatus.Requested, ...rest }: OrderProps,
    id?: UniqueEntityID,
  ) {
    super({ status, ...rest }, id);
  }

  @IsEnum(OrderStatus)
  get status(): OrderStatus {
    return this.props?.status;
  }

  @ValidateNested()
  get customer(): Customer {
    return this.props?.customer;
  }

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  get items(): Item[] {
    return this.props?.items;
  }

  @IsISO31661Alpha3()
  get originCountry(): string {
    return this.props?.originCountry;
  }

  @IsOptional()
  @IsNumber()
  get shipmentCost(): Optional<ShipmentCost> {
    return this.props?.shipmentCost;
  }

  get destination(): Address {
    return this.customer?.selectedAddress;
  }

  async calculateShipmentCost(
    calculator: ShipmentCostCalculatorPort,
  ): Promise<void> {
    const shipmentCost: ShipmentCost = await calculator.getRate({
      originCountry: this.originCountry,
      destinationCountry: this.destination.country,
      packages: this.items.map(({ weight, width, length, height }) => ({
        weight,
        dimensions: { width, length, height },
      })),
    });

    this.props.shipmentCost = shipmentCost;
  }
}
