import { IsString } from 'class-validator';
import {
  Customer,
  UnidCustomerRequest,
} from '../../../customer/entity/Customer';
import { UseCase } from '../../../common/application';

export type AddReferralCodePayload = Readonly<{
  customerId: Customer['id'];
  refereeCode: string;
}>;

export class AddReferralCodeRequest
  implements UnidCustomerRequest<AddReferralCodePayload> {
  @IsString()
  refereeCode: string;
}

export abstract class IAddReferralCode extends UseCase<
  AddReferralCodePayload,
  void
> {}
