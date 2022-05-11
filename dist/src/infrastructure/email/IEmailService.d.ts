import { Email } from '../../common/domain';
export declare type EmailData = {
    to: Email;
    from?: Email;
    subject: string;
    html: string;
};
export declare abstract class IEmailService {
    sendEmail: (data: EmailData) => Promise<void>;
}
