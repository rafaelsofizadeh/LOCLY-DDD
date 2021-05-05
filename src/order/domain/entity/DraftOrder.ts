import { Modify } from '../../../common/domain';
import { UUID } from '../../../common/domain';
import { Country } from '../data/Country';
import { Currency } from '../data/Currency';
import { Address } from './Address';
import { Item, ItemProps } from './Item';
import { ShipmentCost } from './Order';

export type ServiceFee = {
  currency: Currency;
  amount: number;
};

export interface DraftOrderProps {
  id: UUID;
  customerId: UUID;
  items: Item[];
  originCountry: Country;
  destination: Address;
  shipmentCost: ShipmentCost;
}

export class DraftOrder implements DraftOrderProps {
  readonly id: UUID;

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

  constructor({
    id,
    customerId,
    items,
    originCountry,
    destination,
    shipmentCost,
  }: DraftOrderProps) {
    this.id = id;
    this.customerId = customerId;
    this._items = items;
    this._destination = destination;
    this._shipmentCost = shipmentCost;
    this._originCountry = originCountry;
  }

  static fromData(payload: Modify<DraftOrderProps, { items: ItemProps[] }>) {
    return new this({
      ...payload,
      items: payload.items.map(Item.fromData.bind(Item)),
    });
  }
}
