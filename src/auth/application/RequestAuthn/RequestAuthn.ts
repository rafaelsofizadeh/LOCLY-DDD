import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientSession, MongoClient } from 'mongodb';
import { InjectClient } from 'nest-mongodb';
import { withTransaction } from '../../../common/application';
import { IEmailService } from '../../../infrastructure/email/IEmailService';
import {
  RequestAuthnPayload,
  RequestAuthnResult,
  IRequestAuthn,
} from './IRequestAuthn';
import { IGetCustomerUpsert } from '../../../customer/application/GetCustomerUpsert/IGetCustomerUpsert';
import { EntityType } from '../../entity/Token';
import { IGetHostUpsert } from '../../../host/application/GetHostUpsert/IGetHostUpsert';
import { tokenToString } from '../utils';
import { Email, UUID } from '../../../common/domain';
import { throwCustomException } from '../../../common/error-handling';
import { Country } from '../../../order/entity/Country';

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
    requestAuthnPayload: RequestAuthnPayload,
    mongoTransactionSession?: ClientSession,
  ): Promise<RequestAuthnResult> {
    const authUrl: string = await withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.requestAuthn(requestAuthnPayload, sessionWithTransaction),
      this.mongoClient,
      mongoTransactionSession,
    );

    return authUrl;
  }

  private async requestAuthn(
    { email, type: entityRequestType, country }: RequestAuthnPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<string> {
    const { entityId, entityType } = await this.findOrCreateEntity(
      email,
      entityRequestType,
      country,
      mongoTransactionSession,
    );

    const key = this.configService.get<string>('TOKEN_SIGNING_KEY');
    const expiresIn = this.configService.get<string>(
      'VERIFICATION_TOKEN_EXPIRES_IN',
    );

    const tokenString: string = tokenToString(
      { entityId, entityType, isVerification: true },
      key,
      expiresIn,
    );

    const authUrl = `localhost:3000/auth/${tokenString}`;

    await this.emailService.sendEmail({
      to: email,
      subject: 'Locly log in',
      html: `<a href="${authUrl}>Click on this link to log in to Locly!</a>`,
    });

    return authUrl;
  }

  private async findOrCreateEntity(
    email: Email,
    entityType: EntityType,
    country?: Country,
    mongoTransactionSession?: ClientSession,
  ): Promise<{ entityId: UUID; entityType: EntityType }> {
    if (entityType === EntityType.Customer) {
      const { customer } = await this.getCustomerUpsert.execute(
        { email },
        mongoTransactionSession,
      );

      return {
        entityId: customer.id,
        entityType: EntityType.Customer,
      };
    }

    if (entityType === EntityType.Host) {
      const { host } = await this.getHostUpsert.execute(
        { email, country },
        mongoTransactionSession,
      );

      return {
        entityId: host.id,
        entityType: EntityType.Host,
      };
    }

    throwCustomException('Incorrect entity type', { entityType })();
  }
}
