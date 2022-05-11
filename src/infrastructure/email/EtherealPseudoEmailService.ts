import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import config from '../../../app.configuration';
import { EtherealEmailConfig } from '../../../secrets';

import { throwCustomException } from '../../common/error-handling';
import { EmailData, IEmailService } from './IEmailService';

@Injectable()
export class EtherealPseudoEmailService implements IEmailService {
  private readonly nodemailerTransportConfig: SMTPTransport.Options;
  private readonly transporter: Transporter;

  constructor() {
    const { email: user, password: pass } = config.email as EtherealEmailConfig;

    this.nodemailerTransportConfig = {
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user, pass },
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
