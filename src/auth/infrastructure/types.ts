import { Request } from 'express';
import { UUID } from '../../common/domain';

import { Host } from '../../host/entity/Host';
import { Token } from '../entity/Token';

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

// For type annotation purposes
type CustomerId = UUID;

export type Identity = {
  entity: CustomerId | Host | Token | null;
  type: IdentityType;
};
