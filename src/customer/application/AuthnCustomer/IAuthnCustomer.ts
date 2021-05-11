import { IsEmail } from 'class-validator';
import { UseCase } from '../../../common/application';
import { Email } from '../../entity/Customer';

export interface AuthnCustomerRequest {
  readonly email: Email;
}

export class AuthnCustomerRequest implements AuthnCustomerRequest {
  @IsEmail()
  readonly email: Email;
}

export type AuthnCustomerResult = void;

export abstract class IAuthnCustomer extends UseCase<
  AuthnCustomerRequest,
  AuthnCustomerResult
> {}

export type VerificationPayload = { email: Email };
