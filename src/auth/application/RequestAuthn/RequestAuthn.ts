import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { ClientSession, MongoClient } from 'mongodb';
import { InjectClient } from 'nest-mongodb';
import { withTransaction } from '../../../common/application';
import { IEmailService } from '../../../infrastructure/email/IEmailService';
import {
  RequestAuthnRequest,
  RequestAuthnResult,
  IRequestAuthn,
} from './IRequestAuthn';
import { IGetCustomerUpsert } from '../../../customer/application/GetCustomerUpsert/IGetCustomerUpsert';
import { TokenEntityType, EntityType, Token } from '../../entity/Token';
import { IGetHostUpsert } from '../../../host/application/GetHostUpsert/IGetHostUpsert';
import { completeToken } from '../utils';

@Injectable()
export class RequestAuthn implements IRequestAuthn {
  constructor(
    private readonly getCustomerUpsert: IGetCustomerUpsert,
    private readonly getHostUpsert: IGetHostUpsert,
    private readonly configService: ConfigService,
    private readonly emailService: IEmailService,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    requestAuthnRequest: RequestAuthnRequest,
    mongoTransactionSession?: ClientSession,
  ): Promise<RequestAuthnResult> {
    await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.requestAuthn(requestAuthnRequest, sessionWithTransaction),
      this.mongoClient,
      mongoTransactionSession,
    );
  }

  private async requestAuthn(
    { email, type }: RequestAuthnRequest,
    mongoTransactionSession: ClientSession,
  ): Promise<void> {
    let token: string;

    if (type === EntityType.Customer) {
      const { customer } = await this.getCustomerUpsert.execute(
        { email },
        mongoTransactionSession,
      );

      token = this.createVerificationTokenString(
        completeToken({
          entityId: customer.id,
          forEntity: TokenEntityType.Customer,
          isVerification: true,
        }),
      );
    } else if (type === EntityType.Host) {
      const { host, upsert } = await this.getHostUpsert.execute(
        { email },
        mongoTransactionSession,
      );

      const hostType: TokenEntityType = upsert
        ? TokenEntityType.UnverifiedHost
        : TokenEntityType.Host;

      token = this.createVerificationTokenString(
        completeToken({
          entityId: host.id,
          forEntity: hostType,
          isVerification: true,
        }),
      );
    }

    await this.emailService.sendEmail({
      to: email,
      subject: 'Locly authentication link!',
      html: `<a href="localhost:3000/auth/verify/${token}">Click on this link to log in to Locly!</a>`,
    });
  }

  private createVerificationTokenString(token: Token): string {
    const key = this.configService.get<string>('TOKEN_SIGNING_KEY');
    const expiresIn = this.configService.get<string>(
      'VERIFICATION_TOKEN_EXPIRES_IN',
    );

    const tokenString: string = jwt.sign(token, key, { expiresIn });

    return tokenString;
  }
}
