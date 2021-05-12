import { Injectable } from '@nestjs/common';
import { createTransport, Transporter, SendMailOptions } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { throwCustomException } from '../../common/error-handling';
import { IEmailService } from './IEmailService';

@Injectable()
export class EmailService implements IEmailService {
  // TODO: ConfigService
  private readonly nodemailerTransportConfig: SMTPTransport.Options = {
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'marquis.pacocha95@ethereal.email',
      pass: '2RySqgyTQH5C9rxpMz',
    },
  };

  private readonly transporter: Transporter = createTransport(
    this.nodemailerTransportConfig,
  );

  async sendEmail(options: SendMailOptions): Promise<void> {
    if (!options.from) {
      options.from = this.nodemailerTransportConfig.auth.user;
    }

    const emailSendingResult = await this.transporter
      .sendMail(options)
      .catch(throwCustomException('Error sending email', options));
  }
}
