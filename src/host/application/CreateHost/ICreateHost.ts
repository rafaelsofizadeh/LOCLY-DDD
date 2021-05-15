import { IsEmail, IsOptional } from 'class-validator';
import { UseCase } from '../../../common/application';
import { Email } from '../../../common/domain';
import { Host } from '../../entity/Host';

export interface CreateHostRequest {
  readonly email: Email;
}

export class CreateHostRequest implements CreateHostRequest {
  @IsOptional()
  @IsEmail()
  readonly email: Email;
}

export abstract class ICreateHost extends UseCase<CreateHostRequest, Host> {}
