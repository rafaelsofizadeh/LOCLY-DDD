import { ConfirmedOrder, ConfirmedOrderProps } from './ConfirmedOrder';
import { DraftedOrder, DraftedOrderProps } from './DraftedOrder';
import {
  ReceivedByHostOrder,
  ReceivedByHostOrderProps,
} from './ReceivedByHostOrder';
import {
  VerifiedByHostOrder,
  VerifiedByHostOrderProps,
} from './VerifiedByHostOrder';

// TODO(GLOBAL): Inheritance between OrderTypes

export type ShipmentCost = {
  amount: number;
  currency: string;
};

export const OrderStatus = {
  Drafted: 'drafted',
  Confirmed: 'confirmed',
  ReceivedByHost: 'host_received',
  VerifiedByHost: 'host_verified',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export type Order =
  | DraftedOrder
  | ConfirmedOrder
  | ReceivedByHostOrder
  | VerifiedByHostOrder;

export type EditableOrderProps =
  | Omit<DraftedOrderProps, 'id'>
  | Omit<ConfirmedOrderProps, 'id'>
  | Omit<ReceivedByHostOrderProps, 'id'>
  | Omit<VerifiedByHostOrderProps, 'id'>;

export function isDraftedOrder(order: Order): order is DraftedOrder {
  return order.status === OrderStatus.Drafted;
}

export function isConfirmedOrder(order: Order): order is ConfirmedOrder {
  return order.status === OrderStatus.Confirmed;
}

export function isReceivedByHostOrder(
  order: Order,
): order is ReceivedByHostOrder {
  return order.status === OrderStatus.ReceivedByHost;
}

export function isVerifiedByHostOrder(
  order: Order,
): order is VerifiedByHostOrder {
  return order.status === OrderStatus.VerifiedByHost;
}
