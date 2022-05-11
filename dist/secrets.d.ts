import { EmailConfig } from 'app.configuration';
export declare type ConfigSecrets = {
    mongoConnectionString: string;
    authTokenKey: string;
    stripe: {
        apiKey: string;
        webhookSecret: string;
    };
    email: EmailConfig;
};
export declare type EtherealEmailConfig = typeof etherealEmail;
export declare type MailchimpEmailConfig = typeof mailchimpEmail;
declare const etherealEmail: {
    service: string;
    email: string;
    password: string;
};
declare const mailchimpEmail: {
    service: string;
    email: string;
    password: string;
};
declare const _default: ConfigSecrets;
export default _default;
