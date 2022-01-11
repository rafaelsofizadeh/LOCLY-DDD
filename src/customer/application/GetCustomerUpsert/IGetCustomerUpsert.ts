import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Customer } from '../../entity/Customer';

export type GetCustomerUpsertPayload = Readonly<{
  email: UUID;
}>;

export type GetCustomerUpsertResult = {
  customer: Customer;
  upsert: boolean;
};

export abstract class IGetCustomerUpsert extends UseCase<
  GetCustomerUpsertPayload,
  GetCustomerUpsertResult
> {}
