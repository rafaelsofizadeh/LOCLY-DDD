import { Token } from '../../entity/Token';

export abstract class IVerifyAuthn {
  abstract execute(verificationToken: Token): string;
}
