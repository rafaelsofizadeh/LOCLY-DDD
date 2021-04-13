import { UUID } from '../../../common/domain/UUID';
import { Code } from '../../../common/error-handling/Code';
import { Exception } from '../../../common/error-handling/Exception';
import {
  getShipmentCostQuote,
  ShipmentCostQuote,
  ShipmentCostQuoteFn,
} from '../../application/services/ShipmentCostCalculator/getShipmentCostQuote';
import { Country } from '../data/Country';
import { Address, AddressPropsPlain } from './Address';
import { OrderStatus, ShipmentCost } from './Order';
import { PhysicalItem, PhysicalItemPropsPlain } from './PhysicalItem';

export interface VerifiedByHostOrderProps {
  id: UUID;
  status: OrderStatus;
  physicalItems: PhysicalItem[];
  originCountry: Country;
  destination: Address;
  shipmentCost: ShipmentCost;
}

export type VerifiedByHostOrderPropsPlain = Omit<
  VerifiedByHostOrderProps,
  'physicalItems' | 'destination' | 'shipmentCost'
> & {
  physicalItems: PhysicalItemPropsPlain[];
  destination: AddressPropsPlain;
  shipmentCost: ShipmentCost;
};

export class VerifiedByHostOrder implements VerifiedByHostOrderProps {
  readonly id: UUID;

  readonly status: OrderStatus = OrderStatus.VerifiedByHost;

  readonly originCountry: Country;

  readonly destination: Address;

  private _physicalItems: PhysicalItem[];

  private _shipmentCost: ShipmentCost;

  private readonly shipmentCostQuoteFn: ShipmentCostQuoteFn;

  get physicalItems(): PhysicalItem[] {
    return this._physicalItems;
  }

  private setPhysicalItems(physicalItems: PhysicalItem[]) {
    this._physicalItems = physicalItems;
    this._shipmentCost = this.approximateShipmentCost();
  }

  get shipmentCost(): ShipmentCost {
    return this._shipmentCost;
  }

  private approximateShipmentCost(
    physicalItems: PhysicalItem[] = this._physicalItems,
  ): ShipmentCost {
    const { currency, services }: ShipmentCostQuote = this.shipmentCostQuoteFn({
      originCountry: this.originCountry,
      destinationCountry: this.destination.country,
      packages: physicalItems.map(
        ({ physicalCharacteristics }) => physicalCharacteristics,
      ),
    });

    // TODO: Service choice logic
    const { price: amount } = services[0];

    return { amount, currency };
  }

  constructor({
    id,
    physicalItems,
    originCountry,
    destination,
    shipmentCost,
  }: Omit<VerifiedByHostOrderProps, 'status'>) {
    this.shipmentCostQuoteFn = getShipmentCostQuote;

    this.id = id;
    this._physicalItems = physicalItems;
    this.destination = destination;
    this._shipmentCost = shipmentCost;
    this.originCountry = originCountry;
  }

  static create({
    physicalItems,
    originCountry,
    destination,
  }: Omit<
    VerifiedByHostOrderProps,
    'id' | 'status' | 'shipmentCost'
  >): VerifiedByHostOrder {
    // Placeholder values for further redundancy checks in set__() methods
    const verifiedByHostOrder: VerifiedByHostOrder = new this({
      id: UUID(),
      physicalItems,
      originCountry,
      destination,
      shipmentCost: { amount: -999, currency: '---' },
    });

    verifiedByHostOrder.setPhysicalItems(physicalItems);

    return verifiedByHostOrder;
  }

  edit({ physicalItems }: Pick<VerifiedByHostOrderProps, 'physicalItems'>) {
    if (!this.areItemsAssignable(physicalItems)) {
      throw new Exception(
        Code.INTERNAL_ERROR,
        "Host cannot add or remove any items from the list, only update existing items's properties.",
      );
    }

    this.setPhysicalItems(physicalItems);
  }

  private areItemsAssignable(comparateItems: PhysicalItem[]): boolean {
    return (
      this._physicalItems.length == comparateItems.length &&
      this._physicalItems.every(({ id: itemId }) =>
        comparateItems.some(
          ({ id: comparateItemId }) => itemId === comparateItemId,
        ),
      )
    );
  }

  serialize(): VerifiedByHostOrderPropsPlain {
    return {
      id: this.id,
      status: this.status,
      physicalItems: this.physicalItems.map(physicalItem =>
        physicalItem.serialize(),
      ),
      destination: this.destination.serialize(),
      originCountry: this.originCountry,
      shipmentCost: this.shipmentCost,
    };
  }
}
