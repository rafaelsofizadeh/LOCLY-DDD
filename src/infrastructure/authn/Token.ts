import { UUID } from '../../common/domain';

export type Grant = string;

export type Grants = ReadonlyArray<Grant>;

export const CustomerGrants = [
  'account/customer/*',
  'order/customer/*',
] as const;

export const UnverifiedHostGrants = ['account/host/unverified/*'] as const;

export const HostGrants = ['account/host/*', 'order/host/*'] as const;

export enum EntityTokenType {
  Customer = 'customer',
  UnverifiedHost = 'unverified_host',
  Host = 'host',
}

export enum MiscTokenType {
  Verification = 'verification',
}

export const TokenType = { ...EntityTokenType, ...MiscTokenType };
export type TokenType = typeof TokenType;

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

export type EntityId = { customerId: UUID } | { hostId: UUID };

export type EntityToken = Readonly<
  EntityId & {
    grants: Grants;
    refresh: true;
  }
>;

export type VerificationToken = Readonly<
  EntityId & {
    type: MiscTokenType.Verification;
    grants: Grants;
    refresh: false;
  }
>;

export type Token = EntityToken | VerificationToken;

export type Identity = Token & { isIdentified: true };
