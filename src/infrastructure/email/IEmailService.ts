import { Email } from '../../common/domain';

export type EmailData = {
  to: Email;
  from?: Email;
  subject: string;
  html: string;
};

export abstract class IEmailService {
  sendEmail: (data: EmailData) => Promise<void>;
}
