import { Request } from 'express';
import { UUID } from '../../common/domain';

import { Host } from '../../host/entity/Host';
import { Token } from '../entity/Token';

export type CookieAuthnFnRet<T> = T | null | false;

export type CookieAuthnFn<T> = (
  cookies: Record<string, any>,
) => CookieAuthnFnRet<T> | Promise<CookieAuthnFnRet<T>>;

export type IdentifiedRequest<T> = Request & {
  identity: T;
};

export enum IdentityType {
  Customer = 'customer',
  Host = 'host',
  VerificationToken = 'verification_token',
}

// For type annotation purposes
type CustomerId = UUID;

export type Identity = {
  entity: CustomerId | Host | Token;
  type: IdentityType;
};
