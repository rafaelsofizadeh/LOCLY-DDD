import { SendMailOptions } from 'nodemailer';

export abstract class IEmailService implements IEmailService {
  sendEmail: (options: SendMailOptions) => Promise<void>;
}
