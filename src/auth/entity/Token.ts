import { UUID } from '../../common/domain';

export enum UserType {
  Customer = 'customer',
  Host = 'host',
}

export type Token = Readonly<{
  id: UUID;
  type: UserType;
  isVerification: boolean;
}>;
