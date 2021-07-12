import { Injectable } from '@nestjs/common';
import { Email } from '../../../common/domain';
import { IEmailService } from '../../../infrastructure/email/IEmailService';
import { IAuthDeliveryStrategy } from './IAuthDeliveryStrategy';

type AuthUrl = string;
type EmailAuthDeliveryResult = AuthUrl;

@Injectable()
export class EmailAuthDeliveryStrategy implements IAuthDeliveryStrategy {
  constructor(private readonly emailService: IEmailService) {}

  async deliverAuth(
    authTokenString: string,
    email: Email,
  ): Promise<EmailAuthDeliveryResult> {
    const authUrl = `localhost:3000/auth/${authTokenString}`;

    // TODO: Email templating
    await this.emailService.sendEmail({
      to: email,
      subject: 'Locly log in',
      html: `<a href="${authUrl}">Click on this link to log in to Locly!</a>`,
    });

    return authUrl;
  }
}