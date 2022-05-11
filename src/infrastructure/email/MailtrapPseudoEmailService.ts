import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import config from '../../../app.configuration';
import { EmailConfig } from '../../../secrets';

import { throwCustomException } from '../../common/error-handling';
import { EmailData, IEmailService } from './IEmailService';

@Injectable()
export class MailtrapPseudoEmailService implements IEmailService {
  private readonly nodemailerTransportConfig: SMTPTransport.Options;
  private readonly transporter: Transporter;

  constructor() {
    const { user, pass } = config.email as EmailConfig;

    this.nodemailerTransportConfig = {
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: { user, pass },
    };

    this.transporter = createTransport(this.nodemailerTransportConfig);
  }

  async sendEmail(options: EmailData): Promise<void> {
    if (!options.from) {
      options.from = this.nodemailerTransportConfig.auth.user;
    }

    console.log(this.nodemailerTransportConfig, options);

    try {
      await this.transporter.sendMail(options);
    } catch (error) {
      console.log(error);
      return throwCustomException('Error sending email', options)(error);
    }
  }
}
