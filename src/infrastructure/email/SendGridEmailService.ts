import { Injectable } from '@nestjs/common';
import Sendgrid, { MailDataRequired } from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';

import { throwCustomException } from '../../common/error-handling';
import { EmailData, IEmailService } from './IEmailService';

@Injectable()
export class SendgridEmailService implements IEmailService {
  constructor(private readonly configService: ConfigService) {
    const sendGridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    Sendgrid.setApiKey(sendGridApiKey);
    Sendgrid;
  }

  async sendEmail(data: EmailData): Promise<void> {
    data.from =
      data.from || this.configService.get<string>('VERIFICATION_SENDER_EMAIL');

    const emailSendingResult = await Sendgrid.send(
      data as MailDataRequired,
    ).catch(throwCustomException('Error sending email', data));
  }
}
