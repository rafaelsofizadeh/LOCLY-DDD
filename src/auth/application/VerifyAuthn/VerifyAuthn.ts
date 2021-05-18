import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { Token } from '../../entity/Token';
import { completeToken } from '../utils';
import { IVerifyAuthn } from './IVerifyAuthn';

@Injectable()
export class VerifyAuthn implements IVerifyAuthn {
  constructor(private readonly configService: ConfigService) {}

  execute(verificationToken: Token): string {
    // TODO: Check if payload is following VerificationTokenPayload type
    return this.createAuthnToken(verificationToken);
  }

  // TODO: Unify with function in AuthInteceptor. Unified token-creation method ?
  private createAuthnToken(verificationToken: Token): string {
    const entityToken = completeToken({
      ...verificationToken,
      isVerification: false,
    });

    const key = this.configService.get<string>('TOKEN_SIGNING_KEY');
    const expiresIn = this.configService.get<string>('AUTHN_TOKEN_EXPIRES_IN');

    return jwt.sign(entityToken, key, { expiresIn });
  }
}
