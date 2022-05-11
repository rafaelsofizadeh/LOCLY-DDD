import { Token } from '../../entity/Token';
export declare abstract class IVerifyAuth {
    abstract execute(verificationToken: Token): string;
}
