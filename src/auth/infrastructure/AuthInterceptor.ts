import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UserType, Token } from '../entity/Token';
import { stringToToken } from '../application/utils';
import { IHostRepository } from '../../host/persistence/IHostRepository';
import { throwCustomException } from '../../common/error-handling';
import { Host } from '../../host/entity/Host';
import { Identity, IdentityType, IdentifiedRequest } from '../entity/Identity';
import { COOKIE_CORS_CONFIG } from '../../GlobalModule';

@Injectable()
export class CookieAuthInterceptor implements NestInterceptor {
  constructor(
    private readonly configService: ConfigService,
    private readonly hostRepository: IHostRepository,
    @Inject(COOKIE_CORS_CONFIG) private readonly cookieCorsConfig: Partial<CookieOptions>,
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

    if (token.type === UserType.Customer) {
      return { entity: token.id, type: IdentityType.Customer };
    }

    if (token.type === UserType.Host) {
      const host: Host = await this.hostRepository
        .findHost({
          hostId: token.id,
        })
        .catch(
          /**
           * Exposing the host id in the error message shouldn't have any security risk. To hit this point in code,
           * the attacker would anyway have to be able to spoof the JWT token.
           *
           * However, this exception should IMMEDIATELY launch an investigation, because either:
           * a) The attacker indeed has obtained the JWT token encryption key and is sending fake JWT token in the
           * cookies to try and access a host account.
           * b) There is a bug in the code producing invalid host credentials.
           */
          throwCustomException(
            'Host not found',
            { hostId: token.id },
            HttpStatus.NOT_FOUND,
          ),
        );

      return {
        entity: host,
        type: host.verified ? IdentityType.Host : IdentityType.UnverifiedHost,
      };
    }
  }

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    const path = request.path;
    if (path === this.configService.get<string>('STRIPE_WEBHOOK_PATH')) {
      return next.handle();
    }

    const cookies = this.getCookies(request);

    const authIndicatorCookieName = this.configService.get<string>(
      'AUTH_INDICATOR_COOKIE_NAME',
    );
    const authIndicator: string = cookies?.[authIndicatorCookieName];

    // Response is undefined if the response is injected in the controller (using @Res())
    // https://stackoverflow.com/questions/55205145/why-does-nestjs-interceptor-return-undefined
    if (response && !authIndicator) {
      response.cookie(authIndicatorCookieName, false, {
      ...this.cookieCorsConfig,
        httpOnly: false,
        // 10 years
        maxAge: 365 * 24 * 60 * 60 * 10,
      });
    }

    const authCookieName = this.configService.get<string>('TOKEN_COOKIE_NAME');
    const tokenString: string = cookies?.[authCookieName];
    let token: Token;

    if (tokenString) {
      const key = this.configService.get<string>('TOKEN_SIGNING_KEY');
      const { token: newToken, expiredAt, errorMessage } = stringToToken(
        tokenString,
        key,
      );

      // TODO: Refresh token?
      if (Boolean(expiredAt)) {
        throwCustomException(
          'Token expired' + (errorMessage ? `: ${errorMessage}` : ''),
          { expiredAt },
          HttpStatus.REQUEST_TIMEOUT,
        )();
      }

      if (Boolean(errorMessage)) {
        throwCustomException(
          'Invalid auth token' + (errorMessage ? `: ${errorMessage}` : ''),
          undefined,
          HttpStatus.FORBIDDEN,
        )();
      }

      token = newToken;
    }

    const identity: Identity = await this.tokenToIdentity(token);

    if (!identity) {
      throwCustomException(
        'Invalid auth token',
        undefined,
        HttpStatus.FORBIDDEN,
      )();
    }

    (request as IdentifiedRequest<Identity>).identity = identity;

    return next.handle();
  }
}
