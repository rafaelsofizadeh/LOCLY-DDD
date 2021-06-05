import { Token } from '../../entity/Token';

export abstract class IVerifyAuth {
  abstract execute(verificationToken: Token): string;
}
