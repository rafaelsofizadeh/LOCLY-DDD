import { Request } from 'express';
import { UUID } from '../../common/domain';

import { Host } from '../../host/entity/Host';
import { Token } from './Token';

export type IdentifiedRequest<T> = Request & {
  identity: T;
};

export enum IdentityType {
  Customer = 'customer',
  Host = 'host',
  UnverifiedHost = 'unverified_host',
  VerificationToken = 'verification_token',
  Anonymous = 'anonymous',
}

// Just a type annotation
type CustomerId = UUID;

export type Identity = {
  entity: CustomerId | Host | Token | null;
  type: IdentityType;
};
