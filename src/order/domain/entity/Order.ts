import { ConfirmedOrder } from './ConfirmedOrder';
import { DraftedOrder } from './DraftedOrder';
import { ReceivedByHostOrder } from './ReceivedByHostOrder';

export type ShipmentCost = {
  amount: number;
  currency: string;
};

export const OrderStatus = {
  Drafted: 'drafted',
  Confirmed: 'confirmed',
  ReceivedByHost: 'host_received',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export type Order = DraftedOrder | ConfirmedOrder | ReceivedByHostOrder;
