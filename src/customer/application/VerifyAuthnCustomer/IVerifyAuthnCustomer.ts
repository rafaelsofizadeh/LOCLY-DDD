import { Token } from '../../entity/Customer';

export abstract class IVerifyAuthnCustomer {
  abstract execute(verificationToken: Token): Token;
}
