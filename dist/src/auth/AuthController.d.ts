import { Response } from 'express';
import { RequestAuthRequest, IRequestAuth } from './application/RequestAuth/IRequestAuth';
import { IVerifyAuth } from './application/VerifyAuth/IVerifyAuth';
import { Token } from './entity/Token';
export declare class AuthController {
    private readonly requestAuth;
    private readonly verifyAuth;
    private tokenCookieConfig;
    private authCookieConfig;
    constructor(requestAuth: IRequestAuth, verifyAuth: IVerifyAuth);
    requestAuthHandler(requestAuthRequest: RequestAuthRequest, identity: null): Promise<void>;
    verifyAuthHandler(response: Response, verificationToken: Token): Promise<void>;
    logoutHandler(response: Response): Promise<void>;
}
