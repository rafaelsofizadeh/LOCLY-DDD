import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { throwCustomException } from '../../../common/error-handling';
import { validateAndDecodeTokenPayload } from '../../../infrastructure/authn/AuthxInterceptor';
import {
  EntityTokenPayload,
  VerificationTokenPayload,
} from '../../../infrastructure/authn/Token';
import { IVerifyAuthnCustomer } from './IVerifyAuthnCustomer';

// TODO: Rename VerifyAuthnCustomer to VerifyAuthn

@Injectable()
export class VerifyAuthnCustomer implements IVerifyAuthnCustomer {
  constructor(private readonly configService: ConfigService) {}

  execute(verificationTokenString: string): string {
    // TODO: Combine with AuthxInterceptor [RELATED: AuthxInterceptor TODO]
    if (!verificationTokenString.length) {
      throwCustomException(
        'No token provided',
        undefined,
        HttpStatus.UNAUTHORIZED,
      )();
    }

    const key = this.configService.get<string>('AUTHN_COOKIE_SIGNING_KEY');
    const { payload, expiredAt, errorMessage } = validateAndDecodeTokenPayload(
      verificationTokenString,
      key,
    );

    if (!payload) {
      throwCustomException(
        `Invalid token – ${errorMessage}`,
        { token: verificationTokenString },
        HttpStatus.UNAUTHORIZED,
      )();
    }

    if (expiredAt) {
      throwCustomException(
        `Token expired – ${errorMessage}`,
        { token: verificationTokenString },
        HttpStatus.UNAUTHORIZED,
      )();
    }

    // TODO: Check if payload is following VerificationTokenPayload type
    return this.createAuthnToken(payload as VerificationTokenPayload);
  }

  private createAuthnToken({
    for: entityType,
    type,
    ...restVerificationTokenPayload
  }: VerificationTokenPayload): string {
    const key = this.configService.get<string>('AUTHN_COOKIE_SIGNING_KEY');
    const expiresIn = this.configService.get<string>('AUTHN_COOKIE_EXPIRES_IN');

    // TODO: Extract to a fn
    const entityTokenPayload: EntityTokenPayload = {
      ...restVerificationTokenPayload,
      type: entityType,
    };

    // TODO: Token payload creation functions/classes
    return jwt.sign(entityTokenPayload, key, { expiresIn });
  }
}
