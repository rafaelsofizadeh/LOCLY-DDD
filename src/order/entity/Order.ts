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

export type Cost = Readonly<{
  currency: Currency;
  amount: number;
}>;

export enum OrderStatus {
  Drafted = 'drafted',
  Confirmed = 'confirmed',
  Finalized = 'finalized',
  Paid = 'paid',
  Completed = 'completed',
}

export type Order = Readonly<{
  id: UUID;
  originCountry: Country;
  destination: Address;
  status: OrderStatus;
  customerId: UUID;
  items: Item[];
  initialShipmentCost: Cost;
  hostId: UUID;
  hostAddress: Address;
  totalWeight: Gram;
  finalShipmentCost: Cost;
  calculatorResultUrl?: URL;
  deliveryEstimateDays?: number;
  proofOfPayment: UUID;
}>;

export type DraftedOrder = Pick<
  Order,
  'id' | 'customerId' | 'originCountry' | 'destination' | 'initialShipmentCost'
> & { status: OrderStatus.Drafted; items: DraftedItem[] };

export type ConfirmedOrder = Omit<DraftedOrder, 'status' | 'items'> &
  Pick<Order, 'hostId' | 'hostAddress'> & {
    status: OrderStatus.Confirmed;
    items: Item[];
  };

export type FinalizedOrder = Omit<ConfirmedOrder, 'status' | 'items'> &
  Pick<
    Order,
    | 'totalWeight'
    | 'initialShipmentCost'
    | 'calculatorResultUrl'
    | 'deliveryEstimateDays'
  > & {
    status: OrderStatus.Finalized;
    items: Array<ReceivedItem | FinalizedItem>;
  };

export type PaidOrder = Omit<FinalizedOrder, 'status' | 'items'> &
  Pick<Order, 'finalShipmentCost'> & {
    status: OrderStatus.Finalized;
    items: Array<FinalizedItem>;
  };

export type OrderFilter = EntityFilter<Order, { orderId: UUID }>;

export type OrderItemFilter = OrderFilter & { item: ItemFilter };
