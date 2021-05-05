import { UUID } from '../../../common/domain';
import { ShipmentCost } from './Order';
import { PhysicalItemProps } from './Item';

export interface VerifiedByHostOrderProps {
  id: UUID;
  physicalItems: PhysicalItemProps[];
  shipmentCost: ShipmentCost;
}

export class VerifiedByHostOrder implements VerifiedByHostOrderProps {
  readonly id: UUID;

  private _physicalItems: PhysicalItemProps[];

  private _shipmentCost: ShipmentCost;

  get physicalItems(): PhysicalItemProps[] {
    return this._physicalItems;
  }

  get shipmentCost(): ShipmentCost {
    return this._shipmentCost;
  }

  private constructor({
    id,
    physicalItems,
    shipmentCost,
  }: VerifiedByHostOrderProps) {
    this.id = id;
    this._physicalItems = physicalItems;
    this._shipmentCost = shipmentCost;
  }

  static fromData(payload: VerifiedByHostOrderProps) {
    return new this(payload);
  }

  static create({
    physicalItems,
  }: Omit<
    VerifiedByHostOrderProps,
    'id' | 'shipmentCost'
  >): VerifiedByHostOrder {
    const verifiedByHostOrder: VerifiedByHostOrder = new this({
      id: UUID(),
      physicalItems,
      shipmentCost: { amount: -999, currency: '---' },
    });

    return verifiedByHostOrder;
  }
}
