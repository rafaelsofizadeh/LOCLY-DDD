import { IsEmail } from 'class-validator';
import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Email } from '../../entity/Customer';

export interface RequestAuthnCustomerRequest {
  readonly email: Email;
}

export class RequestAuthnCustomerRequest
  implements RequestAuthnCustomerRequest {
  @IsEmail()
  readonly email: Email;
}

export type RequestAuthnCustomerResult = void;

export abstract class IRequestAuthnCustomer extends UseCase<
  RequestAuthnCustomerRequest,
  RequestAuthnCustomerResult
> {}

export type VerificationPayload = { customerId: UUID };
