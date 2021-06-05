import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Token } from '../../entity/Token';
import { tokenToString } from '../utils';
import { IVerifyAuth } from './IVerifyAuth';

@Injectable()
export class VerifyAuth implements IVerifyAuth {
  constructor(private readonly configService: ConfigService) {}

  execute(verificationToken: Token): string {
    // TODO: Check if payload is following VerificationTokenPayload type
    return this.createAuthTokenFromVerificationToken(verificationToken);
  }

  private createAuthTokenFromVerificationToken({ id, type }: Token): string {
    const key = this.configService.get<string>('TOKEN_SIGNING_KEY');
    const expiresIn = this.configService.get<string>('AUTH_TOKEN_EXPIRES_IN');

    return tokenToString({ id, type, isVerification: false }, key, expiresIn);
  }
}
