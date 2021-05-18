import { UUID } from '../../common/domain';

export const CustomerGrants = ['account/customer', 'order/customer'] as const;
export const UnverifiedHostGrants = ['account/host/unverified'] as const;
export const HostGrants = ['account/host', 'order/host'] as const;
export const VerificationGrants = [] as const;

export type Grants =
  | typeof CustomerGrants
  | typeof UnverifiedHostGrants
  | typeof HostGrants
  | typeof VerificationGrants;

// TODO: merge/intersect enums
export enum EntityType {
  Customer = 'customer',
  Host = 'host',
}

export enum EntityTypeWithStatus {
  Customer = 'customer',
  UnverifiedHost = 'unverified_host',
  Host = 'host',
}

export type Token = Readonly<{
  entityType: EntityTypeWithStatus;
  entityId: UUID;
  isVerification: boolean;
  grants: Grants;
  refresh: boolean;
}>;

export type TokenIdentity = Token & { isIdentified: true };
