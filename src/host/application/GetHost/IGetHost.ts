import { IsEmail, IsOptional } from 'class-validator';
import { UseCase } from '../../../common/application';
import { Email, IsUUID, UUID } from '../../../common/domain';
import { Host } from '../../entity/Host';

export interface GetHostPayload {
  readonly hostId?: UUID;
  readonly email?: Email;
}

export class GetHostRequest implements GetHostPayload {
  @IsOptional()
  @IsEmail()
  readonly email?: Email;

  @IsOptional()
  @IsUUID()
  readonly hostId?: UUID;
}

export abstract class IGetHost extends UseCase<GetHostPayload, Host> {}
