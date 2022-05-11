import { Address, UUID } from '../../common/domain';
import { EntityFilter } from '../../common/persistence';
import { Country } from './Country';
import { Currency } from './Currency';
import { URL } from '../application/SubmitShipmentInfo/ISubmitShipmentInfo';
import { DraftedItem, FinalizedItem, Gram, Item, ItemFilter, ReceivedItem } from './Item';
export declare type Cost = Readonly<{
    currency: Currency;
    amount: number;
}>;
export declare enum OrderStatus {
    Drafted = "drafted",
    Confirmed = "confirmed",
    Finalized = "finalized",
    Paid = "paid",
    Completed = "completed"
}
export declare type Order = Readonly<{
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
    trackingNumber: string;
}>;
export declare type DraftedOrder = Pick<Order, 'id' | 'customerId' | 'originCountry' | 'destination' | 'initialShipmentCost'> & {
    status: OrderStatus.Drafted;
    items: DraftedItem[];
};
export declare type ConfirmedOrder = Omit<DraftedOrder, 'status' | 'items'> & Pick<Order, 'hostId' | 'hostAddress'> & {
    status: OrderStatus.Confirmed;
    items: Item[];
};
export declare type FinalizedOrder = Omit<ConfirmedOrder, 'status' | 'items'> & Pick<Order, 'totalWeight' | 'initialShipmentCost' | 'calculatorResultUrl' | 'deliveryEstimateDays'> & {
    status: OrderStatus.Finalized;
    items: Array<ReceivedItem | FinalizedItem>;
};
export declare type PaidOrder = Omit<FinalizedOrder, 'status' | 'items'> & Pick<Order, 'finalShipmentCost'> & {
    status: OrderStatus.Finalized;
    items: Array<FinalizedItem>;
};
export declare type OrderFilter = EntityFilter<Order, {
    orderId: UUID;
}>;
export declare type OrderItemFilter = OrderFilter & {
    item: ItemFilter;
};
