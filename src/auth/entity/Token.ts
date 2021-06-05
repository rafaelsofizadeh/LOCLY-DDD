import { UUID } from '../../common/domain';

export enum EntityType {
  Customer = 'customer',
  Host = 'host',
}

export type Token = Readonly<{
  id: UUID;
  type: EntityType;
  isVerification: boolean;
}>;
