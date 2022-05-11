import { EntityFilter } from '../../common/persistence';
import { UUID } from '../../common/domain';
export declare type Gram = number;
export declare type PhysicalItem = Readonly<{
    id: UUID;
    weight: Gram;
}>;
export declare type Item = PhysicalItem & Readonly<{
    title: string;
    url?: string;
    photoIds: UUID[];
    receivedDate: Date;
}>;
export declare type DraftedItem = Pick<Item, 'id' | 'title' | 'url' | 'weight'>;
export declare type ReceivedItem = DraftedItem & Pick<Item, 'receivedDate'>;
export declare type FinalizedItem = ReceivedItem & Pick<Item, 'photoIds'>;
export declare type ItemFilter = EntityFilter<Item, {
    itemId: UUID;
}>;
