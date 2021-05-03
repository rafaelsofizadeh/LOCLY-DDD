import { WithoutId } from '../../../common/domain';
import { ConfirmOrder, ConfirmOrderProps } from './ConfirmOrder';
import { DraftOrder, DraftOrderProps } from './DraftOrder';
import { ReceiveOrderItem, ReceiveOrderItemProps } from './ReceiveOrderItem';
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
  ReceivedByHost: 'host_received',
  VerifiedByHost: 'host_verified',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export type Order =
  | DraftOrder
  | ConfirmOrder
  | ReceiveOrderItem
  | VerifiedByHostOrder;

export type OrderProps = DraftOrderProps &
  ConfirmOrderProps &
  ReceiveOrderItemProps &
  VerifiedByHostOrderProps;

export type OrderFilter = Required<Pick<OrderProps, 'id'>> &
  Partial<
    WithoutId<OrderProps> & {
      status: OrderStatus;
    }
  >;
