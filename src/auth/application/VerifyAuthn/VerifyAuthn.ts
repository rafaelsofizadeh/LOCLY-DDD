import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Token } from '../../entity/Token';
import { tokenToString } from '../utils';
import { IVerifyAuthn } from './IVerifyAuthn';

@Injectable()
export class VerifyAuthn implements IVerifyAuthn {
  constructor(private readonly configService: ConfigService) {}

  execute(verificationToken: Token): string {
    // TODO: Check if payload is following VerificationTokenPayload type
    return this.createAuthnToken({
      ...verificationToken,
      isVerification: false,
    });
  }

  private createAuthnToken(tokenPayload: Token): string {
    const key = this.configService.get<string>('TOKEN_SIGNING_KEY');
    const expiresIn = this.configService.get<string>('AUTHN_TOKEN_EXPIRES_IN');

    return tokenToString(tokenPayload, key, expiresIn);
  }
}
