import { EntityFilter } from '../../../common/domain';
import { ConfirmOrder, ConfirmOrderProps } from './ConfirmOrder';
import { DraftOrder, DraftOrderProps } from './DraftOrder';
import { ItemFilter } from './Item';
import {
  VerifiedByHostOrder,
  VerifiedByHostOrderProps,
} from './VerifiedByHostOrder';

export type ShipmentCost = {
  amount: number;
  currency: string;
};

export const OrderStatus = {
  Drafted: 'drafted',
  Confirmed: 'confirmed',
  VerifiedByHost: 'host_verified',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export type Order = DraftOrder | ConfirmOrder | VerifiedByHostOrder;

export type OrderProps = DraftOrderProps &
  ConfirmOrderProps &
  VerifiedByHostOrderProps;

export type OrderFilter = EntityFilter<
  OrderProps & {
    status: OrderStatus;
  }
>;

export type OrderItemFilter = OrderFilter & { item: ItemFilter };
