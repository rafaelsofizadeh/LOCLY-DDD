import { EntityFilter } from '../../../common/domain';
import { ConfirmOrder } from './ConfirmOrder';
import { DraftOrder } from './DraftOrder';
import { ItemFilter } from './Item';

export type ShipmentCost = {
  amount: number;
  currency: string;
};

export const DraftedOrderStatus = 'drafted' as const;

export const ConfirmedOrderStatus = 'confirmed' as const;

export type OrderStatus =
  | typeof DraftedOrderStatus
  | typeof ConfirmedOrderStatus;

export type Order = DraftOrder | ConfirmOrder;

type AnyOrder = DraftOrder & ConfirmOrder;

export type OrderFilter = EntityFilter<
  AnyOrder & {
    status: OrderStatus;
  }
>;

export type OrderItemFilter = OrderFilter & { item: ItemFilter };
