import { EntityProps } from '../../../common/domain/Entity';
import { EntityId } from '../../../common/domain/EntityId';
import { Code } from '../../../common/error-handling/Code';
import { Exception } from '../../../common/error-handling/Exception';
import { EntityIdsToStringIds } from '../../../common/types';
import {
  checkServiceAvailability,
  ServiceAvailabilityFn,
} from '../../application/services/checkServiceAvailability';
import {
  getShipmentCostQuote,
  ShipmentCostQuote,
  ShipmentCostQuoteFn,
} from '../../application/services/ShipmentCostCalculator/getShipmentCostQuote';
import { Country } from '../data/Country';
import { Address, AddressPropsPlain } from './Address';
import { ConfirmedOrder } from './ConfirmedOrder';
import { Host } from './Host';
import { Item, ItemPropsPlain } from './Item';
import { OrderStatus, ShipmentCost } from './Order';

export interface DraftedOrderProps extends EntityProps {
  status: OrderStatus;
  customerId: EntityId;
  items: Item[];
  originCountry: Country;
  destination: Address;
  shipmentCost: ShipmentCost;
}

export type DraftedOrderPropsPlain = Omit<
  EntityIdsToStringIds<DraftedOrderProps>,
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
  readonly id: EntityId;

  readonly status: OrderStatus = OrderStatus.Drafted;

  readonly customerId: EntityId;

  private _items: Item[];

  private _originCountry: Country;

  private _destination: Address;

  private _shipmentCost: ShipmentCost;

  private readonly shipmentCostQuoteFn: ShipmentCostQuoteFn;

  private readonly serviceAvailabilityFn: ServiceAvailabilityFn;

  get items(): Item[] {
    return this._items;
  }

  private setItems(items: Item[]): Array<keyof this> {
    this._items = items;
    this._shipmentCost = this.approximateShipmentCost();

    return ['items', 'shipmentCost'];
  }

  private approximateShipmentCost(items: Item[] = this._items): ShipmentCost {
    const { currency, services }: ShipmentCostQuote = this.shipmentCostQuoteFn({
      originCountry: this.originCountry,
      destinationCountry: this.destination.country,
      packages: items.map(
        ({ physicalCharacteristics }) => physicalCharacteristics,
      ),
    });

    // TODO: Service choice logic
    const { price: amount } = services[0];

    return { amount, currency };
  }

  get originCountry(): Country {
    return this._originCountry;
  }

  private setOriginCountry(originCountry: Country): Array<keyof this> {
    const isServiceAvailable: boolean = this.serviceAvailabilityFn(
      originCountry,
      this._destination.country,
    );

    if (!isServiceAvailable) {
      throw new Exception(
        Code.VALIDATION_ERROR,
        'Origin country not available.',
        originCountry,
      );
    }

    this._originCountry = originCountry || this._originCountry;
    this._shipmentCost = this.approximateShipmentCost();

    return ['originCountry', 'shipmentCost'];
  }

  get destination(): Address {
    return this._destination;
  }

  private setDestination(destination: Address): Array<keyof this> {
    const isServiceAvailable: boolean = this.serviceAvailabilityFn(
      this._originCountry,
      destination.country,
    );

    if (!isServiceAvailable) {
      throw new Exception(
        Code.VALIDATION_ERROR,
        'Destination country not available.',
        destination,
      );
    }

    this._destination = destination || this._destination;
    this._shipmentCost = this.approximateShipmentCost();

    return ['destination', 'shipmentCost'];
  }

  get shipmentCost(): ShipmentCost {
    return this._shipmentCost;
  }

  constructor({
    id,
    customerId,
    items,
    originCountry,
    destination,
    shipmentCost,
  }: Omit<DraftedOrderProps, 'status'>) {
    this.shipmentCostQuoteFn = getShipmentCostQuote;
    this.serviceAvailabilityFn = checkServiceAvailability;

    this.id = id;
    this.customerId = customerId;
    this._items = items;
    this._destination = destination;
    this._shipmentCost = shipmentCost;
    this._originCountry = originCountry;
  }

  static create({
    customerId,
    items,
    originCountry,
    destination,
  }: Omit<DraftedOrderProps, 'id' | 'status' | 'shipmentCost'>): DraftedOrder {
    // Placeholder values for further redundancy checks in set__() methods
    const draftedOrder: DraftedOrder = new this({
      id: new EntityId(),
      customerId: customerId,
      items,
      originCountry,
      destination,
      shipmentCost: { amount: -999, currency: '---' },
    });

    draftedOrder.setItems(items);
    draftedOrder.setDestination(destination);
    draftedOrder.setOriginCountry(originCountry);

    return draftedOrder;
  }

  edit(editOrderProps: DraftedOrderEditProps): (keyof this)[] {
    const inputEditedKeys = <(keyof DraftedOrderEditProps & keyof this)[]>(
      // TODO: Should user be able to edit only defined properties (!!this[key])?
      Object.keys(editOrderProps).filter(key => key in this && !!this[key])
    );

    const totalEditedKeys = [...inputEditedKeys];

    for (const key of inputEditedKeys) {
      const editValue = editOrderProps[key];
      const setterFnName = 'set' + key.charAt(0).toUpperCase() + key.slice(1);
      const editedKeys = this[setterFnName](editValue);

      totalEditedKeys.push(...editedKeys);
    }

    const uniqueEditedKeys = [...new Set(totalEditedKeys)];

    return uniqueEditedKeys; /*.map(key => ({
      [key]: this[key],
    })) as DraftedOrderEditProps*/
  }

  toConfirmed({ id: hostId }: Host): ConfirmedOrder {
    return new ConfirmedOrder({ ...this, hostId });
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
}
