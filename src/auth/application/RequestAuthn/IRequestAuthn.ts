import { IsEmail, IsEnum, IsISO31661Alpha3, IsOptional } from 'class-validator';
import { UseCase } from '../../../common/application';
import { Email } from '../../../common/domain';
import { Country } from '../../../order/entity/Country';
import { EntityType } from '../../entity/Token';

export type RequestAuthnPayload = Readonly<{
  email: Email;
  type: EntityType;
  country?: Country;
}>;

export class RequestAuthnRequest implements RequestAuthnPayload {
  @IsEmail()
  readonly email: Email;

  @IsEnum(EntityType)
  readonly type: EntityType;

  @IsOptional()
  @IsISO31661Alpha3()
  readonly country?: Country;
}

export type RequestAuthnResult = void;

export abstract class IRequestAuthn extends UseCase<
  RequestAuthnPayload,
  RequestAuthnResult
> {}
