import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Email } from '../../common/domain';
import { throwCustomException } from '../../common/error-handling';
import { EmailData, IEmailService } from './IEmailService';

@Injectable()
export class EtherealPseudoEmailService implements IEmailService {
  private readonly nodemailerTransportConfig: SMTPTransport.Options;
  private readonly transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.nodemailerTransportConfig = {
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: this.configService.get<Email>('ETHEREAL_EMAIL'),
        pass: this.configService.get<Email>('ETHEREAL_PASSWORD'),
      },
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
