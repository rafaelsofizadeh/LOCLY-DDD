import { SetMetadata } from '@nestjs/common';

export const AUTHN_STATUS = '@eropple/nestjs-auth:AuthnStatus';

export enum AuthnStatus {
  Required = 'required',
  Optional = 'optional',
  Disallowed = 'disallowed',
}

export const AuthnRequired = () =>
  SetMetadata(AUTHN_STATUS, AuthnStatus.Required);

export const AuthnOptional = () =>
  SetMetadata(AUTHN_STATUS, AuthnStatus.Optional);

export const AuthnDisallowed = () =>
  SetMetadata(AUTHN_STATUS, AuthnStatus.Disallowed);
