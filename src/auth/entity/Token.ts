import { UUID } from '../../common/domain';

// TODO: Think through grants & scopes
export const CustomerGrants = ['account/customer', 'order/customer'] as const;
export const UnverifiedHostGrants = ['account/host'] as const;
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
  entityId: UUID;
  isVerification: boolean;
  grants: Grants;
  refresh: boolean;
}> & {
  // EntityType can be changed, e.g. from Host to VerifiedHost, in the course of auth flow
  entityType: EntityTypeWithStatus;
};
