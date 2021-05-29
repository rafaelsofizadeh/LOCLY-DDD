import { UUID } from '../../common/domain';

export enum EntityType {
  Customer = 'customer',
  Host = 'host',
}

export type Token = Readonly<{
  entityId: UUID;
  entityType: EntityType;
  isVerification: boolean;
}>;
