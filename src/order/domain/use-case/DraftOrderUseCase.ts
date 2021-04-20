import { UUID } from '../../../common/domain/UUID';
import { Country } from '../data/Country';
import { ItemProps } from '../entity/Item';
import { DraftedOrder } from '../entity/DraftedOrder';
import { UseCase } from '../../../common/domain/UseCase';
import { Address } from '../entity/Address';
import { WithoutId } from '../../../common/domain/types';

export interface DraftOrderRequest {
  customerId: UUID;
  originCountry: Country;
  destination: Address;
  items: WithoutId<ItemProps>[];
}

export abstract class DraftOrderUseCase extends UseCase<
  DraftOrderRequest,
  DraftedOrder
> {}
