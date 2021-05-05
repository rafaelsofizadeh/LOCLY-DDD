import { UUID } from '../../../common/domain';
import { Country } from '../data/Country';
import { Currency } from '../data/Currency';
import { Address } from './Address';
import { Item } from './Item';
import { DraftedOrderStatus, ShipmentCost } from './Order';

export type ServiceFee = {
  readonly currency: Currency;
  readonly amount: number;
};

export interface DraftOrder {
  readonly id: UUID;
  readonly status: typeof DraftedOrderStatus;
  readonly customerId: UUID;
  readonly items: Item[];
  readonly originCountry: Country;
  readonly destination: Address;
  readonly shipmentCost: ShipmentCost;
}
