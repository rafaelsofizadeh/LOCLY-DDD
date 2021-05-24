import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Country } from '../../../order/entity/Country';
import { Host } from '../../entity/Host';

export type GetHostUpsertPayload = Readonly<{
  email: UUID;
  country?: Country;
}>;

export type GetHostUpsertResult = {
  host: Host;
  upsert: boolean;
};

export abstract class IGetHostUpsert extends UseCase<
  GetHostUpsertPayload,
  GetHostUpsertResult
> {}
