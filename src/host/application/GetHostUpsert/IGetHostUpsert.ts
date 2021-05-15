import { IsEmail } from 'class-validator';
import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Host } from '../../entity/Host';

export interface GetHostUpsertRequest {
  readonly email: UUID;
}

export class GetHostUpsertRequest implements GetHostUpsertRequest {
  @IsEmail()
  readonly email: UUID;
}

export type GetHostUpsertResult = {
  host: Host;
  upsert: boolean;
};

export abstract class IGetHostUpsert extends UseCase<
         GetHostUpsertRequest,
         GetHostUpsertResult
       > {}
