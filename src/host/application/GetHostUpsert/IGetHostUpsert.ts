import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Host } from '../../entity/Host';

export interface GetHostUpsertPayload {
  readonly email: UUID;
}

export type GetHostUpsertResult = {
  host: Host;
  upsert: boolean;
};

export abstract class IGetHostUpsert extends UseCase<
  GetHostUpsertPayload,
  GetHostUpsertResult
> {}
