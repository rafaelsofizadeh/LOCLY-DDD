import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { throwCustomException } from '../../../common/error-handling';
import { Token } from '../../entity/Customer';
import { VerificationPayload } from '../AuthnCustomer/IAuthnCustomer';
import { IVerifyAuthn } from './IVerifyAuthn';

@Injectable()
export class VerifyAuthn implements IVerifyAuthn {
  constructor(private readonly configService: ConfigService) {}

  execute(verificationToken: Token): Token {
    const verificationPayload = this.decodeVerificationToken(verificationToken);

    return this.createAuthnToken(verificationPayload);
  }

  private decodeVerificationToken(token: Token): VerificationPayload {
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

  private createAuthnToken(verificationPayload: VerificationPayload): string {
    const key = this.configService.get<string>('AUTHN_JWT_SIGNING_KEY');
    const expiresIn = this.configService.get<string>('AUTHN_JWT_EXPIRES_IN');

    const { ...authnPayload } = verificationPayload;

    return jwt.sign(authnPayload, key, { expiresIn });
  }
}
