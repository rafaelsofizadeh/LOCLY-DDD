import { IsEmail, IsOptional } from 'class-validator';
import { UseCase } from '../../../common/application';
import { Email } from '../../../common/domain';
import { Host } from '../../entity/Host';

export interface CreateHostPayload {
  readonly email: Email;
}

export abstract class ICreateHost extends UseCase<CreateHostPayload, Host> {}
