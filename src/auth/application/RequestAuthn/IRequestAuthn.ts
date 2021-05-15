import { IsEmail, IsEnum } from 'class-validator';
import { UseCase } from '../../../common/application';
import { Email } from '../../../common/domain';
import { EntityType } from '../../entity/Token';

export interface RequestAuthnRequest {
  readonly email: Email;
  readonly type: EntityType;
}

export class RequestAuthnRequest implements RequestAuthnRequest {
  @IsEmail()
  readonly email: Email;

  @IsEnum(EntityType)
  readonly type: EntityType;
}

export type RequestAuthnResult = void;

export abstract class IRequestAuthn extends UseCase<
  RequestAuthnRequest,
  RequestAuthnResult
> {}
