import { EntityFilter, UUID } from '../../../common/domain';
import { Country } from '../data/Country';
import { Currency } from '../data/Currency';
import { URL } from '../use-case/FinalizeOrderUseCase';
import { Gram, Item, ItemFilter } from './Item';

export type Cost = {
  amount: number;
  currency: string;
};

export type ServiceFee = {
  readonly currency: Currency;
  readonly amount: number;
};

export type Address = {
  country: Country;
};

// TODO: revert back to OrderStatus const-literal-enum
export const DraftedOrderStatus = 'drafted' as const;

export interface DraftOrder {
  readonly id: UUID;
  readonly status: typeof DraftedOrderStatus;
  readonly customerId: UUID;
  readonly items: Item[];
  readonly originCountry: Country;
  readonly destination: Address;
  readonly shipmentCost: Cost;
}

export const ConfirmedOrderStatus = 'confirmed' as const;

export interface ConfirmOrder {
  readonly id: UUID;
  readonly status: typeof ConfirmedOrderStatus;
  readonly customerId: UUID;
  readonly originCountry: Country;
  readonly hostId: UUID;
}

export interface HostOrder {
  readonly id: UUID;
  readonly hostId: UUID;
  readonly receivedDate: Date;
  readonly totalWeight: Gram;
  readonly deliveryCost: Cost;
  readonly calculatorResultUrl?: URL;
}

export type OrderStatus =
  | typeof DraftedOrderStatus
  | typeof ConfirmedOrderStatus;

export type Order = (
  | Omit<DraftOrder, 'status'>
  | Omit<ConfirmOrder, 'status'>
) & { status: OrderStatus };

export type AnyOrder = Omit<DraftOrder, 'status'> &
  Omit<ConfirmOrder, 'status'> &
  HostOrder & { status: OrderStatus };

// TODO: Vary OrderFilter allowed properties based on OrderStatus
export type OrderFilter = EntityFilter<AnyOrder, { orderId: UUID }>;

export type OrderItemFilter = OrderFilter & { item: ItemFilter };
