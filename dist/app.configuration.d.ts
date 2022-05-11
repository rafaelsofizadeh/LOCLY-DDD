import { EtherealEmailConfig, MailchimpEmailConfig } from 'secrets';
declare const _default: AppConfig;
export default _default;
export declare type StripeConfig = {
    apiKey: string;
    apiVersion: '2020-08-27';
    webhook: {
        secret: string;
        path: string;
    };
    successPageUrl: string;
    cancelPageUrl: string;
};
export declare type MongoConfig = {
    connectionString: string;
    dbName: string;
};
export declare type CookieConfig = {
    authIndicatorName: string;
    tokenName: string;
    tokenExpiration: string;
    cors: {
        secure: boolean;
        sameSite: 'strict' | 'lax' | 'none';
    };
};
export declare type AuthConfig = {
    tokenKey: string;
    verificationTokenExpiration: string;
    authTokenExpiration: string;
};
export declare type AppConfig = {
    domain: string;
    nodeEnv: 'dev' | 'prod';
    stripe: StripeConfig;
    mongo: MongoConfig;
    cookie: CookieConfig;
    auth: AuthConfig;
    email: EmailConfig;
    serviceFee: {
        stripeProductId: string;
        stripePriceId: string;
        loclyCutPercent: number;
    };
    rewards: {
        referralUsd: number;
        refereeUsd: number;
        codeLength: number;
    };
    host: {
        payoutDelayDays: number;
    };
};
export declare type EmailConfig = EtherealEmailConfig | MailchimpEmailConfig;
