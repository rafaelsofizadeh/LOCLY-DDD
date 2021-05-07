import { UUID } from '../../../common/domain';
import { EntityFilter } from '../../../common/persistence';
import { Country } from '../data/Country';
import { Currency } from '../data/Currency';
import { URL } from '../use-case/FinalizeOrderUseCase';
import {
  DraftedItem,
  FinalizedItem,
  Gram,
  Item,
  ItemFilter,
  ReceivedItem,
} from './Item';

export type Cost = Readonly<{
  currency: Currency;
  amount: number;
}>;

export type Address = Readonly<{
  country: Country;
}>;

export enum OrderStatus {
  Drafted = 'drafted',
  Confirmed = 'confirmed',
  Finalized = 'finalized',
}

export type Order = Readonly<{
  id: UUID;
  status: OrderStatus;
  customerId: UUID;
  items: Item[];
  originCountry: Country;
  destination: Address;
  shipmentCost: Cost;
  hostId: UUID;
  totalWeight: Gram;
  deliveryCost: Cost;
  calculatorResultUrl: URL;
}>;

export type DraftedOrder = Pick<
  Order,
  'id' | 'customerId' | 'originCountry' | 'destination' | 'shipmentCost'
> & { status: OrderStatus.Drafted; items: DraftedItem[] };

export type ConfirmedOrder = Omit<DraftedOrder, 'status'> &
  Pick<Order, 'hostId'> & { status: OrderStatus.Confirmed };

export type FinalizedOrder = Omit<ConfirmedOrder, 'status' | 'items'> &
  Pick<Order, 'totalWeight' | 'deliveryCost' | 'calculatorResultUrl'> & {
    status: OrderStatus.Finalized;
    items: Array<ReceivedItem | FinalizedItem>;
  };

// TODO: Vary OrderFilter allowed properties based on OrderStatus
export type OrderFilter = EntityFilter<Order, { orderId: UUID }>;

export type OrderItemFilter = OrderFilter & { item: ItemFilter };
