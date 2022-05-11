import { Token } from '../../entity/Token';
import { IVerifyAuth } from './IVerifyAuth';
export declare class VerifyAuth implements IVerifyAuth {
    execute(verificationToken: Token): string;
    private verificationTokenToAuthToken;
}
