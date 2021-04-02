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
import { Category, Item, ItemPropsPlain } from './Item';
import { OrderStatus, ShipmentCost } from './Order';

// class-transformer type annotations are used for serialization in CreateOrderUseCase
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

export class DraftedOrder implements DraftedOrderProps {
  private _id: EntityId;

  private _status: OrderStatus = OrderStatus.Drafted;

  private _customerId: EntityId;

  private _items: Item[];

  private _originCountry: Country;

  private _destination: Address;

  private _shipmentCost: ShipmentCost;

  private shipmentCostQuoteFn: ShipmentCostQuoteFn;

  private serviceAvailabilityFn: ServiceAvailabilityFn;

  get id(): EntityId {
    return this._id;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get customerId(): EntityId {
    return this._customerId;
  }

  get items(): Item[] {
    return this._items;
  }

  private setItems(items: Item[]) {
    //if (this.haveItemPhysicalCharsChanged(items)) { }
    this._items = items;
    this._shipmentCost = this.approximateShipmentCost();
  }

  private haveItemPhysicalCharsChanged(newItems: Item[]): boolean {
    if (this._items === undefined) {
      return false;
    }

    if (this._items.length !== newItems.length) {
      return false;
    }

    const oldItemPhysicalChars = this._items.map(
      ({ id, physicalCharacteristics }) => ({
        id,
        ...physicalCharacteristics,
      }),
    );

    const newItemPhysicalChars = newItems.map(
      ({ id, physicalCharacteristics }) => ({
        id,
        ...physicalCharacteristics,
      }),
    );

    return newItemPhysicalChars.some(newItem =>
      Object.keys(newItem).some(newKey => {
        const sameItemButOld = oldItemPhysicalChars.find(
          oldItem => oldItem.id.value === newItem.id.value,
        );

        if (!sameItemButOld) {
          // "true" -> some discrepancy between old and new items
          return true;
        }

        return sameItemButOld[newKey] !== newItem[newKey];
      }),
    );
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

  private setOriginCountry(originCountry: Country) {
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
  }

  get destination(): Address {
    return this._destination;
  }

  private setDestination(destination: Address) {
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
  }

  get shipmentCost(): ShipmentCost {
    return this._shipmentCost;
  }

  // TODO(RN): private constructor, create() method?
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

    this._id = id;
    this._customerId = customerId;
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
  }: Omit<DraftedOrderProps, 'id' | 'status' | 'shipmentCost'>) {
    // Placeholder values for further redundancy checks in set__() methods
    const draftedOrder = new this({
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
}
