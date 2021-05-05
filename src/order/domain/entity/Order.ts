import { EntityFilter } from '../../../common/domain';
import { ConfirmOrder, ConfirmOrderProps } from './ConfirmOrder';
import { DraftOrder, DraftOrderProps } from './DraftOrder';
import { ItemFilter } from './Item';

export type ShipmentCost = {
  amount: number;
  currency: string;
};

export const OrderStatus = {
  Drafted: 'drafted',
  Confirmed: 'confirmed',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export type Order = DraftOrder | ConfirmOrder;

export type OrderProps = DraftOrderProps & ConfirmOrderProps;

export type OrderFilter = EntityFilter<
  OrderProps & {
    status: OrderStatus;
  }
>;

export type OrderItemFilter = OrderFilter & { item: ItemFilter };
