import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import {
  EntityToken,
  EntityTokenPayload,
  VerificationToken,
} from '../../entity/Token';
import { payloadToToken } from '../../infrastructure/AuthxInterceptor';
import { IVerifyAuthn } from './IVerifyAuthn';

@Injectable()
export class VerifyAuthn implements IVerifyAuthn {
  constructor(private readonly configService: ConfigService) {}

  execute(verificationToken: VerificationToken): string {
    // TODO: Check if payload is following VerificationTokenPayload type
    return this.createAuthnToken(verificationToken);
  }

  // TODO: Unify with function in AuthInteceptor. Unified token-creation method ?
  private createAuthnToken(verificationToken: VerificationToken): string {
    const key = this.configService.get<string>('TOKEN_SIGNING_KEY');
    const expiresIn = this.configService.get<string>('AUTHN_TOKEN_EXPIRES_IN');

    const { for: forEntity, type, ...restToken } = verificationToken;

    const entityToken = payloadToToken({
      ...restToken,
      type: forEntity,
    }) as EntityToken;

    return jwt.sign(entityToken, key, { expiresIn });
  }
}
