import { Type } from 'class-transformer';
import { EntityProps } from '../../../common/domain/Entity';
import { EntityId } from '../../../common/domain/EntityId';
import { EntityIdsToStringIds } from '../../../common/types';
import { TransformEntityIdToString } from '../../../common/utils';
import {
  ShipmentCostQuote,
  ShipmentCostRequest,
} from '../../application/services/ShipmentCostCalculator/getShipmentCostQuote';
import { Country } from '../data/Country';
import { Address, AddressPropsPlain } from './Address';
import { ConfirmedOrder } from './ConfirmedOrder';
import { Host } from './Host';
import { Item, ItemPropsPlain } from './Item';
import { OrderStatus, ShipmentCost } from './Order';

// class-transformer type annotations are used for serialization in CreateOrderUseCase
export class DraftedOrderProps extends EntityProps {
  status: OrderStatus = 'drafted';

  @Type(() => EntityId)
  @TransformEntityIdToString()
  customerId: EntityId;

  @Type(() => Item)
  items: Item[];

  originCountry: Country;

  @Type(() => Address)
  destination: Address;

  shipmentCost?: ShipmentCost;
}

export type DraftedOrderPropsPlain = Omit<
  EntityIdsToStringIds<DraftedOrderProps>,
  'items' | 'destination' | 'shipmentCost'
> & {
  items: ItemPropsPlain[];
  destination: AddressPropsPlain;
  shipmentCost: ShipmentCost;
};

export class DraftedOrder extends DraftedOrderProps {
  constructor(
    {
      id = new EntityId(),
      customerId,
      items,
      originCountry,
      destination,
    }: // default value is needed for class-validator plainToClass. Refer to: Order.ts.
    Omit<
      DraftedOrderProps,
      'status' | 'shipmentCost'
    > = new DraftedOrderProps(),
  ) {
    super();

    this.status = OrderStatus.Drafted;

    this.id = id;
    this.items = items;
    this.customerId = customerId;
    this.destination = destination;
    this.originCountry = originCountry;
  }

  // TODO: Persist Customer to Order more explicitly maybe?
  initialize(
    getShipmentCostRate: (
      costRequest: ShipmentCostRequest,
    ) => ShipmentCostQuote,
  ) {
    // TODO: Process getShipmentCost result
    this.shipmentCost = this.approximateShipmentCost(getShipmentCostRate);
  }

  toConfirmed(): ConfirmedOrder {
    return new ConfirmedOrder(this);
  }

  serialize(): DraftedOrderPropsPlain {
    return {
      id: this.id.value,
      status: this.status,
      customerId: this.customerId.value,
      items: this.items.map(item => item.serialize()),
      destination: this.destination.serialize(),
      originCountry: this.originCountry,
      shipmentCost: this.shipmentCost,
    };
  }

  private approximateShipmentCost(
    getShipmentCostRate: (
      costRequest: ShipmentCostRequest,
    ) => ShipmentCostQuote,
  ): ShipmentCost {
    const { currency, services }: ShipmentCostQuote = getShipmentCostRate({
      originCountry: this.originCountry,
      destinationCountry: this.destination.country,
      packages: this.items.map(
        ({ physicalCharacteristics }) => physicalCharacteristics,
      ),
    });

    // TODO: Service choice logic
    const { price: amount } = services[0];

    return { amount, currency };
  }
}
