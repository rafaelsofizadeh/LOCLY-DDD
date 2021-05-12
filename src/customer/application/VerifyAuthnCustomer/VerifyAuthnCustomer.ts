import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { throwCustomException } from '../../../common/error-handling';
import { Token } from '../../entity/Customer';
import { CustomerAuthnVerificationPayload } from '../RequestAuthnCustomer/IRequestAuthnCustomer';
import { IVerifyAuthnCustomer } from './IVerifyAuthnCustomer';

@Injectable()
export class VerifyAuthnCustomer implements IVerifyAuthnCustomer {
  constructor(private readonly configService: ConfigService) {}

  execute(verificationToken: Token): Token {
    const verificationPayload = this.decodeVerificationToken(verificationToken);

    return this.createAuthnToken(verificationPayload);
  }

  private decodeVerificationToken(
    token: Token,
  ): CustomerAuthnVerificationPayload {
    try {
      const key = this.configService.get<string>(
        'VERIFICATION_COOKIE_SIGNING_KEY',
      );

      return jwt.verify(token, key) as CustomerAuthnVerificationPayload;
    } catch ({ name: errorName, message }) {
      if (errorName === 'TokenExpiredError') {
        throwCustomException(message, undefined, HttpStatus.REQUEST_TIMEOUT)();
      }

      if (errorName === 'JsonWebTokenError') {
        throwCustomException(message)();
      }
    }
  }

  private createAuthnToken(
    verificationPayload: CustomerAuthnVerificationPayload,
  ): string {
    const key = this.configService.get<string>('AUTHN_JWT_SIGNING_KEY');
    const expiresIn = this.configService.get<string>('AUTHN_COOKIE_EXPIRES_IN');

    const { customerId, ...restVerificationPayload } = verificationPayload;

    return jwt.sign({ customerId }, key, { expiresIn });
  }
}
