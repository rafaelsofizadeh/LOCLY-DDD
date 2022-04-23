import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import config, { MailchimpEmailConfig } from '../../../main.configuration';

import { throwCustomException } from '../../common/error-handling';
import { EmailData, IEmailService } from './IEmailService';

@Injectable()
export class MailchimpEmailService implements IEmailService {
  private readonly nodemailerTransportConfig: SMTPTransport.Options;
  private readonly transporter: Transporter;

  constructor() {
    const {
      apiKey,
      verificationSenderEmail,
    } = config.email as MailchimpEmailConfig;

    this.nodemailerTransportConfig = {
      host: 'smtp.mandrillapp.com',
      port: 25,
      auth: { user: verificationSenderEmail, pass: apiKey },
    };

    this.transporter = createTransport(this.nodemailerTransportConfig);
  }

  async sendEmail(options: EmailData): Promise<void> {
    if (!options.from) {
      options.from = this.nodemailerTransportConfig.auth.user;
    }

    const emailSendingResult = await this.transporter
      .sendMail(options)
      .catch(throwCustomException('Error sending email', options));
  }
}
