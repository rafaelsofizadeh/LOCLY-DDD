import { IsEmail } from 'class-validator';
import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Customer } from '../../entity/Customer';

export interface GetCustomerUpsertRequest {
  readonly email: UUID;
}

export class GetCustomerUpsertRequest implements GetCustomerUpsertRequest {
  @IsEmail()
  readonly email: UUID;
}

export type GetCustomerUpsertResult = {
  customer: Customer;
  upsert: boolean;
};

export abstract class IGetCustomerUpsert extends UseCase<
  GetCustomerUpsertRequest,
  GetCustomerUpsertResult
> {}
