import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { ClientSession, MongoClient } from 'mongodb';
import { InjectClient } from 'nest-mongodb';
import { withTransaction } from '../../../common/application';
import { throwCustomException } from '../../../common/error-handling';
import { Customer } from '../../entity/Customer';
import { ICustomerRepository } from '../../persistence/ICustomerRepository';
import { VerificationPayload } from '../AuthnCustomer/IAuthnCustomer';
import {
  VerifyAuthnRequest,
  VerifyAuthnResult,
  IVerifyAuthn,
} from './IVerifyAuthn';

@Injectable()
export class VerifyAuthn implements IVerifyAuthn {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly configService: ConfigService,
    @InjectClient() private readonly mongoClient: MongoClient,
  ) {}

  async execute(
    verifyAuthnRequest: VerifyAuthnRequest,
    mongoTransactionSession?: ClientSession,
  ): Promise<VerifyAuthnResult> {
    return withTransaction(
      (sessionWithTransaction: ClientSession) =>
        this.verifyAuthn(verifyAuthnRequest, sessionWithTransaction),
      this.mongoClient,
      mongoTransactionSession,
    );
  }

  private async verifyAuthn(
    { token }: VerifyAuthnRequest,
    mongoTransactionSession: ClientSession,
  ): Promise<VerifyAuthnResult> {
    // TODO: Handle token expiration
    const { email }: VerificationPayload = this.decodeVerificationToken(token);

    const {
      id: customerId,
    }: Customer = await this.customerRepository.findCustomer(
      { email },
      mongoTransactionSession,
    );

    return { email, customerId };
  }

  private decodeVerificationToken(token: string): VerificationPayload {
    try {
      const key = this.configService.get<string>(
        'VERIFICATION_JWT_SIGNING_KEY',
      );

      return jwt.verify(token, key) as VerificationPayload;
    } catch ({ name: errorName, message }) {
      if (errorName === 'TokenExpiredError') {
        throwCustomException(message, undefined, HttpStatus.REQUEST_TIMEOUT)();
      }

      if (errorName === 'JsonWebTokenError') {
        throwCustomException(message)();
      }
    }
  }
}
