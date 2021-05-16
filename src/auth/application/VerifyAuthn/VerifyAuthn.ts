import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { throwCustomException } from '../../../common/error-handling';
import { validateAndDecodeTokenPayload } from '../../infrastructure/AuthxInterceptor';
import {
  EntityTokenPayload,
  EntityTokenType,
  EntityType,
  VerificationToken,
  VerificationTokenPayload,
} from '../../entity/Token';
import { IVerifyAuthn } from './IVerifyAuthn';
import { UUID } from '../../../common/domain';

@Injectable()
export class VerifyAuthn implements IVerifyAuthn {
  constructor(private readonly configService: ConfigService) {}

  execute(verificationToken: VerificationToken): string {
    // TODO: Check if payload is following VerificationTokenPayload type
    return this.createAuthnToken(verificationToken);
  }

  private createAuthnToken(verificationToken: VerificationToken): string {
    const key = this.configService.get<string>('TOKEN_SIGNING_KEY');
    const expiresIn = this.configService.get<string>('AUTH_TOKEN_EXPIRES_IN');

    // TODO: Proper union typing
    const { customerId, hostId } = verificationToken as any;
    const entityTokenPayload: EntityTokenPayload = customerId
      ? { type: EntityTokenType.Customer, entityId: customerId }
      : { type: EntityTokenType.Host, entityId: hostId };

    // TODO: Token payload creation functions/classes
    return jwt.sign(entityTokenPayload, key, { expiresIn });
  }
}
