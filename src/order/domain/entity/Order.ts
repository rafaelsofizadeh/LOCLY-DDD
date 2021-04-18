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

// TODO(GLOBAL): Inheritance between OrderTypes (what?)

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
