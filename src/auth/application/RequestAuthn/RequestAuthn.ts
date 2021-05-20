import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { EntityType } from '../../entity/Token';
import { IGetHostUpsert } from '../../../host/application/GetHostUpsert/IGetHostUpsert';
import { tokenToString } from '../utils';
import { Email, UUID } from '../../../common/domain';
import { throwCustomException } from '../../../common/error-handling';

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
    { email, type: entityRequestType }: RequestAuthnRequest,
    mongoTransactionSession: ClientSession,
  ): Promise<void> {
    const { entityId, entityType } = await this.findOrCreateEntity(
      email,
      entityRequestType,
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

    await this.emailService.sendEmail({
      to: email,
      subject: 'Locly authentication link!',
      html: `<a href="localhost:3000/auth/verify/${tokenString}">Click on this link to log in to Locly!</a>`,
    });
  }

  private async findOrCreateEntity(
    email: Email,
    entityType: EntityType,
    mongoTransactionSession: ClientSession,
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
        { email },
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
