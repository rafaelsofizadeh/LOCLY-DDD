import { UUID } from '../../../common/domain/UUID';
import { Code } from '../../../common/error-handling/Code';
import { Exception } from '../../../common/error-handling/Exception';
import { ServiceAvailabilityFn } from '../../application/services/checkServiceAvailability';
import {
  ShipmentCostQuote,
  ShipmentCostQuoteFn,
} from '../../application/services/ShipmentCostCalculator/getShipmentCostQuote';
import { Country } from '../data/Country';
import { Address, AddressPropsPlain } from './Address';
import { ConfirmedOrder } from './ConfirmedOrder';
import { Host } from './Host';
import { Item, ItemPropsPlain } from './Item';
import { OrderStatus, ShipmentCost } from './Order';

export interface DraftedOrderProps {
  id: UUID;
  status: OrderStatus;
  customerId: UUID;
  items: Item[];
  originCountry: Country;
  destination: Address;
  shipmentCost: ShipmentCost;
}

export type DraftedOrderPropsPlain = Omit<
  DraftedOrderProps,
  'items' | 'destination' | 'shipmentCost'
> & {
  items: ItemPropsPlain[];
  destination: AddressPropsPlain;
  shipmentCost: ShipmentCost;
};

type DraftedOrderEditProps = Partial<
  Omit<DraftedOrderProps, 'id' | 'status' | 'shipmentCost' | 'customerId'>
>;

// TODO(FUTURE): optimizations, e.g. "has this property changed?". Proxies, more elegant connection between
// originCountry, destination, items.weight and shipmentCost
export class DraftedOrder implements DraftedOrderProps {
  readonly id: UUID;

  readonly status: OrderStatus = OrderStatus.Drafted;

  readonly customerId: UUID;

  private _items: Item[];

  private _originCountry: Country;

  private _destination: Address;

  private _shipmentCost: ShipmentCost;

  get items(): Item[] {
    return this._items;
  }

  get originCountry(): Country {
    return this._originCountry;
  }

  get destination(): Address {
    return this._destination;
  }

  get shipmentCost(): ShipmentCost {
    return this._shipmentCost;
  }

  private constructor({
    id,
    customerId,
    items,
    originCountry,
    destination,
    shipmentCost,
  }: Omit<DraftedOrderProps, 'status'>) {
    this.id = id;
    this.customerId = customerId;
    this._items = items;
    this._destination = destination;
    this._shipmentCost = shipmentCost;
    this._originCountry = originCountry;
  }

  static fromData(payload: Omit<DraftedOrderProps, 'status'>) {
    return new this(payload);
  }

  static async create(
    {
      customerId,
      items,
      originCountry,
      destination,
    }: Omit<DraftedOrderProps, 'id' | 'status' | 'shipmentCost'>,
    shipmentCostQuoteFn: ShipmentCostQuoteFn,
    serviceAvailabilityFn: ServiceAvailabilityFn,
    persist: (draftedOrder: DraftedOrder) => Promise<unknown>,
  ): Promise<DraftedOrder> {
    this.validateOriginDestination(
      originCountry,
      destination,
      serviceAvailabilityFn,
    );

    const draftedOrder: DraftedOrder = new this({
      id: UUID(),
      customerId: customerId,
      items,
      originCountry,
      destination,
      shipmentCost: this.approximateShipmentCost(
        originCountry,
        destination,
        items,
        shipmentCostQuoteFn,
      ),
    });

    await persist(draftedOrder);

    return draftedOrder;
  }

  serialize(): DraftedOrderPropsPlain {
    return {
      id: this.id,
      status: this.status,
      customerId: this.customerId,
      items: this.items.map(item => item.serialize()),
      destination: this.destination.serialize(),
      originCountry: this.originCountry,
      shipmentCost: this.shipmentCost,
    };
  }

  private static validateOriginDestination(
    originCountry: Country,
    { country: destinationCountry }: Address,
    checkServiceAvailability: ServiceAvailabilityFn,
  ) {
    const isServiceAvailable: boolean = checkServiceAvailability(
      originCountry,
      destinationCountry,
    );

    if (!isServiceAvailable) {
      throw new Exception(
        Code.VALIDATION_ERROR,
        `Service unavailable for origin: ${originCountry} & destination: ${destinationCountry}.`,
        { originCountry, destinationCountry },
      );
    }
  }

  private static approximateShipmentCost(
    originCountry: Country,
    { country: destinationCountry }: Address,
    items: Item[],
    getShipmentCostQuote: ShipmentCostQuoteFn,
  ): ShipmentCost {
    const { currency, services }: ShipmentCostQuote = getShipmentCostQuote({
      originCountry,
      destinationCountry,
      packages: items.map(
        ({ physicalCharacteristics }) => physicalCharacteristics,
      ),
    });

    // TODO: Service choice logic
    const { price: amount } = services[0];

    return { amount, currency };
  }
}
