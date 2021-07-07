import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientSession, MongoClient } from 'mongodb';
import { InjectClient } from 'nest-mongodb';
import { Transaction, TransactionUseCasePort, withTransaction } from '../../../common/application';
import { IEmailService } from '../../../infrastructure/email/IEmailService';
import {
  RequestAuthPayload,
  RequestAuthResult,
  IRequestAuth,
} from './IRequestAuth';
import { IGetCustomerUpsert } from '../../../customer/application/GetCustomerUpsert/IGetCustomerUpsert';
import { EntityType } from '../../entity/Token';
import { IGetHostUpsert } from '../../../host/application/GetHostUpsert/IGetHostUpsert';
import { tokenToString } from '../utils';
import { Email, UUID } from '../../../common/domain';
import { throwCustomException } from '../../../common/error-handling';
import { Country } from '../../../order/entity/Country';

/**
 * Functionality for the first step in user auth – accepting user email, generating a verification token and sending it
 * to the said address.
 */
@Injectable()
export class RequestAuth implements IRequestAuth {
  constructor(
    private readonly getCustomerUpsert: IGetCustomerUpsert,
    private readonly getHostUpsert: IGetHostUpsert,
    private readonly configService: ConfigService,
    private readonly emailService: IEmailService,
  ) {}

  @Transaction
  async execute({
    port: requestAuthPayload,
    mongoTransactionSession,
  }: TransactionUseCasePort<RequestAuthPayload>): Promise<RequestAuthResult> {
    return this.requestAuth(requestAuthPayload, mongoTransactionSession);
  }

  private async requestAuth(
    { email, type: entityRequestType, country }: RequestAuthPayload,
    mongoTransactionSession: ClientSession,
  ): Promise<string> {
    const { id: entityId, type: entityType } = await this.findOrCreateEntity(
      email,
      entityRequestType,
      country,
      mongoTransactionSession,
    );

    const key = this.configService.get<string>('TOKEN_SIGNING_KEY');
    const expiresIn = this.configService.get<string>(
      'VERIFICATION_TOKEN_EXPIRES_IN',
    );

    // Create and sign a verification token to be sent by email.
    const tokenString: string = tokenToString(
      { id: entityId, type: entityType, isVerification: true },
      key,
      expiresIn,
    );

    // TODO: Proper URL construction
    const authUrl = `localhost:3000/auth/${tokenString}`;

    // TODO: Email templating
    await this.emailService.sendEmail({
      to: email,
      subject: 'Locly log in',
      html: `<a href="${authUrl}">Click on this link to log in to Locly!</a>`,
    });

    return authUrl;
  }

  // For login, the GetCustomer/HostUpsert use cases are expected to always only GET.
  // For registration, the use cases are expected to always only UPSERT.
  private async findOrCreateEntity(
    email: Email,
    entityType: EntityType,
    // country is expected to be defined only during host registration. All other cases (login, customer registration),
    // country will be undefined.
    country?: Country,
    mongoTransactionSession?: ClientSession,
  ): Promise<{ id: UUID; type: EntityType }> {
    if (entityType === EntityType.Customer) {
      const { customer } = await this.getCustomerUpsert.execute({
        port: { email },
        mongoTransactionSession,
      });

      return {
        id: customer.id,
        type: EntityType.Customer,
      };
    }

    if (entityType === EntityType.Host) {
      const { host } = await this.getHostUpsert.execute({
        port: { email, ...(country ? { country } : {}) },
        mongoTransactionSession,
      });

      return {
        id: host.id,
        type: EntityType.Host,
      };
    }

    throwCustomException('Incorrect entity type', { entityType })();
  }
}
