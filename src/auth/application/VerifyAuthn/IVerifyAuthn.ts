import { VerificationToken } from '../../entity/Token';

export abstract class IVerifyAuthn {
  abstract execute(verificationToken: VerificationToken): string;
}
