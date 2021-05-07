import { UseCase, WithoutId } from '../../../common/domain';
import { DraftedItem } from '../entity/Item';
import { DraftedOrder } from '../entity/Order';

export type DraftOrderRequest = Pick<
  DraftedOrder,
  'customerId' | 'originCountry' | 'destination'
> & { items: WithoutId<DraftedItem>[] };

export abstract class DraftOrderUseCase extends UseCase<
  DraftOrderRequest,
  DraftedOrder
> {}
