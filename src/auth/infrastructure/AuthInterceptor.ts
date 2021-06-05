import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { EntityType, Token } from '../entity/Token';
import { stringToToken } from '../application/utils';
import { IHostRepository } from '../../host/persistence/IHostRepository';
import { throwCustomException } from '../../common/error-handling';
import { Host } from '../../host/entity/Host';
import { Identity, IdentityType, IdentifiedRequest } from './types';

export class CookieAuthInterceptor implements NestInterceptor {
  constructor(
    private readonly configService: ConfigService,
    private readonly hostRepository: IHostRepository,
  ) {}

  private getCookies(request: Request): Record<string, any> {
    return {
      ...request.cookies,
      ...request.signedCookies,
    };
  }

  private async tokenToIdentity(
    token: Token | null | undefined,
  ): Promise<Identity> {
    if (!token) {
      return { entity: null, type: IdentityType.Anonymous };
    }

    if (token.isVerification) {
      return { entity: token, type: IdentityType.VerificationToken };
    }

    if (token.type === EntityType.Customer) {
      return { entity: token.id, type: IdentityType.Customer };
    }

    if (token.type === EntityType.Host) {
      const host: Host = await this.hostRepository.findHost({
        hostId: token.id,
      });

      return {
        entity: host,
        type: host.verified ? IdentityType.Host : IdentityType.UnverifiedHost,
      };
    }
  }

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request: Request = context.switchToHttp().getRequest();

    const cookies = this.getCookies(request);
    const authCookieName = this.configService.get<string>('TOKEN_COOKIE_NAME');
    const tokenString: string = cookies?.[authCookieName];
    let token: Token;

    if (tokenString) {
      const key = this.configService.get<string>('TOKEN_SIGNING_KEY');
      // TODO: Pass error message to CookieAuthInterceptorOptions.throwResponse
      const { token: newToken, expiredAt, errorMessage } = stringToToken(
        tokenString,
        key,
      );

      // TODO: Refresh token?
      if (Boolean(expiredAt) || Boolean(errorMessage)) {
        throwCustomException(
          'Invalid auth token cookie' +
            (errorMessage ? `: ${errorMessage}` : ''),
          undefined,
          HttpStatus.FORBIDDEN,
        )();
      }

      token = newToken;
    }

    const identity: Identity = await this.tokenToIdentity(token).catch(
      throwCustomException('Entity not found', undefined, HttpStatus.FORBIDDEN),
    );

    (request as IdentifiedRequest<Identity>).identity = identity;

    return next.handle();
  }
}
