import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { throwCustomException } from '../../../common/error-handling';
import { validateAndDecodeTokenPayload } from '../../infrastructure/AuthxInterceptor';
import {
  EntityTokenPayload,
  VerificationTokenPayload,
} from '../../entity/Token';
import { IVerifyAuthn } from './IVerifyAuthn';

// TODO: Rename VerifyAuthn to VerifyAuthn

@Injectable()
export class VerifyAuthn implements IVerifyAuthn {
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

    const key = this.configService.get<string>(
      'VERIFICATION_TOKEN_SIGNING_KEY',
    );
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
    // @ts-ignore
    exp,
    ...restVerificationTokenPayload
  }: VerificationTokenPayload): string {
    const key = this.configService.get<string>('AUTHN_TOKEN_SIGNING_KEY');
    const expiresIn = this.configService.get<string>('AUTHN_TOKEN_EXPIRES_IN');

    // TODO: Extract to a fn
    const entityTokenPayload: EntityTokenPayload = {
      ...restVerificationTokenPayload,
      type: entityType,
    };

    // TODO: Token payload creation functions/classes
    return jwt.sign(entityTokenPayload, key, { expiresIn });
  }
}
