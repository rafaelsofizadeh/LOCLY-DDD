import { Token } from '../../entity/Customer';

export abstract class IVerifyAuthn {
  abstract execute(verificationToken: Token): Token;
}
