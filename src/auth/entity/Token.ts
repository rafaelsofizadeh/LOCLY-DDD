import { UUID } from '../../common/domain';

export type Grant = string;

export type Grants = ReadonlyArray<Grant>;

export const CustomerGrants = ['account/customer', 'order/customer'] as const;

export const UnverifiedHostGrants = ['account/host/unverified'] as const;

export const HostGrants = ['account/host', 'order/host'] as const;

// TODO: merge/intersect enums
export enum EntityType {
  Customer = 'customer',
  Host = 'host',
}

export enum EntityTokenType {
  Customer = 'customer',
  UnverifiedHost = 'unverified_host',
  Host = 'host',
}

export enum MiscTokenType {
  Verification = 'verification',
}

export enum TokenType {
  Customer = 'customer',
  Host = 'host',
  UnverifiedHost = 'unverified_host',
  Verification = 'verification',
}

export type EntityTokenPayload = Readonly<{
  entityId: UUID;
  type: EntityTokenType;
}>;

export type VerificationTokenPayload = Readonly<{
  // TODO: Rename 'for'
  for: EntityTokenType;
  entityId: UUID;
  type: MiscTokenType.Verification;
}>;

export type TokenPayload = EntityTokenPayload | VerificationTokenPayload;

export type EntityToken = EntityTokenPayload &
  Readonly<{
    grants: Grants;
    refresh: true;
  }>;

export type VerificationToken = VerificationTokenPayload &
  Readonly<{
    grants: Grants;
    refresh: false;
  }>;

export type Token = EntityToken | VerificationToken;

export type TokenIdentity = Token & { isIdentified: true };
