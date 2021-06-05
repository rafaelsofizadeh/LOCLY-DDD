import { IsEmail, IsEnum, IsISO31661Alpha3, IsOptional } from 'class-validator';
import { UseCase } from '../../../common/application';
import { Email } from '../../../common/domain';
import { Country } from '../../../order/entity/Country';
import { EntityType } from '../../entity/Token';

export type RequestAuthPayload = Readonly<{
  email: Email;
  type: EntityType;
  // country is expected to be defined only during host registration. All other cases (login, customer registration),
  // country will be undefined.
  country?: Country;
}>;

export class RequestAuthRequest implements RequestAuthPayload {
  @IsEmail()
  readonly email: Email;

  @IsEnum(EntityType)
  readonly type: EntityType;

  @IsOptional()
  @IsISO31661Alpha3()
  readonly country?: Country;
}

export type RequestAuthResult = string;

export abstract class IRequestAuth extends UseCase<
  RequestAuthPayload,
  RequestAuthResult
> {}
