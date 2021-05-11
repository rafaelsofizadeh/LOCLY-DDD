import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { Email } from '../../entity/Customer';
import { VerificationPayload } from '../AuthnCustomer/IAuthnCustomer';

export interface VerifyAuthnRequest {
  readonly token: string;
}

export type VerifyAuthnResult = { customerId: UUID } & VerificationPayload;

export abstract class IVerifyAuthn extends UseCase<
  VerifyAuthnRequest,
  VerifyAuthnResult
> {}
