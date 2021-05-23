import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Customer } from '../../entity/Customer';

export interface GetCustomerUpsertPayload {
  readonly email: UUID;
}

export type GetCustomerUpsertResult = {
  customer: Customer;
  upsert: boolean;
};

export abstract class IGetCustomerUpsert extends UseCase<
  GetCustomerUpsertPayload,
  GetCustomerUpsertResult
> {}
