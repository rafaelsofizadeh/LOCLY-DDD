import { Injectable } from '@nestjs/common';
import Sendgrid, { MailDataRequired } from '@sendgrid/mail';

import config, { SendgridEmailConfig } from '../../../main.configuration';

import { throwCustomException } from '../../common/error-handling';
import { EmailData, IEmailService } from './IEmailService';

@Injectable()
export class SendgridEmailService implements IEmailService {
  constructor() {
    Sendgrid.setApiKey((config.email as SendgridEmailConfig).apiKey);
  }

  async sendEmail(data: EmailData): Promise<void> {
    data.from =
      data.from ||
      (config.email as SendgridEmailConfig).verificationSenderEmail;

    const emailSendingResult = await Sendgrid.send(
      data as MailDataRequired,
    ).catch(throwCustomException('Error sending email', data));
  }
}
