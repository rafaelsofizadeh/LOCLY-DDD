import { Address, UUID } from '../../common/domain';
import { EntityFilter } from '../../common/persistence';
import { Country } from './Country';
import { Currency } from './Currency';
import { URL } from '../application/SubmitShipmentInfo/ISubmitShipmentInfo';
import {
  DraftedItem,
  FinalizedItem,
  Gram,
  Item,
  ItemFilter,
  ReceivedItem,
} from './Item';

export interface Cost
  extends Readonly<{
    currency: Currency;
    amount: number;
  }> {}

export enum OrderStatus {
  Drafted = 'drafted',
  Confirmed = 'confirmed',
  Finalized = 'finalized',
  Paid = 'paid',
}

export type Order = Readonly<{
  id: UUID;
  status: OrderStatus;
  customerId: UUID;
  hostId: UUID;
  items: Item[];
  totalWeight: Gram;
  originCountry: Country;
  destination: Address;
  initialShipmentCost: Cost;
  finalShipmentCost: Cost;
  calculatorResultUrl?: URL;
}>;

export type DraftedOrder = Pick<
  Order,
  'id' | 'customerId' | 'originCountry' | 'destination' | 'initialShipmentCost'
> & { status: OrderStatus.Drafted; items: DraftedItem[] };

export type ConfirmedOrder = Omit<DraftedOrder, 'status'> &
  Pick<Order, 'hostId'> & { status: OrderStatus.Confirmed };

export type FinalizedOrder = Omit<ConfirmedOrder, 'status' | 'items'> &
  Pick<Order, 'totalWeight' | 'initialShipmentCost' | 'calculatorResultUrl'> & {
    status: OrderStatus.Finalized;
    items: Array<ReceivedItem | FinalizedItem>;
  };

// TODO: Vary OrderFilter allowed properties based on OrderStatus
export type OrderFilter = EntityFilter<Order, { orderId: UUID }>;

export type OrderItemFilter = OrderFilter & { item: ItemFilter };


