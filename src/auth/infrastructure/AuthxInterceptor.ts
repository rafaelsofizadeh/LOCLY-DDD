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
import { AuthnStatusMetadataKey } from './decorators/authn';
import { AuthnStatus } from './decorators/authn';
import { throwCustomException } from '../../common/error-handling';
import { Host } from '../../host/entity/Host';
import {
  CookieAuthnFnRet,
  Identity,
  IdentityType,
  IdentifiedRequest,
} from './types';

/**
 * The combined authentication layer of `@eropple/nestjs-auth`.
 *
 * For authentication (formerly `CookieAuthnInterceptor`), this takes a
 * user-defined function (see `CookieAuthnOptions`) and determines from it the
 * current state of the requestor's identity. It then uses the `@AuthnXXX()`
 * family of decorators (`@AuthnRequired()`, `@AuthnOptional()`, `@AuthnSkip()` and
 * `@AuthnDisallowed()`) to decide whether or not to return a 401 Unauthorized
 * to the requestor or to pass the request on down the chain.
 *
 * For authorization (formerly `CookieAuthzInterceptor`): nestjs-auth functionally
 * operates on the notion of scopes, as per OAuth2 (not that it's the _best_ way
 * to do this, but it's the most common way you see it in the wild). These
 * scopes are just a list of strings (there's an implicit "and" for these
 * scopes).
 *
 * **Something to pay attention to:** unlike some other implementations of
 * OAuth2 scopes, we use the forward slash character, `/`, as a separator to
 * indicate hierarchy. This is because we use file-style globbing to match the
 * handler's specified scopes against the grants in the identity. Check the
 * documentation for details.
 */
export class CookieAuthxInterceptor implements NestInterceptor {
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

  private shortCircuitBadAuth(
    authnResult: CookieAuthnFnRet<Token>,
    status: AuthnStatus,
  ): boolean {
    switch (status) {
      case AuthnStatus.Required:
        return Boolean(authnResult);
      case AuthnStatus.Disallowed:
        return !Boolean(authnResult);
      case AuthnStatus.Optional:
        return true; // doesn't matter
      case AuthnStatus.Skip:
        return true; // doesn't matter
      default:
        throw new Error(
          `Bad AuthnStatus value (are you not in TypeScript?): ${status}`,
        );
    }
  }

  private async cookieAuthnFn(
    cookies: Record<string, string>,
  ): Promise<CookieAuthnFnRet<Token>> {
    const authnCookieName = this.configService.get<string>('TOKEN_COOKIE_NAME');
    const tokenString: string = cookies?.[authnCookieName];

    if (!tokenString) {
      return null;
    }

    const key = this.configService.get<string>('TOKEN_SIGNING_KEY');
    // TODO: Pass error message to CookieAuthxInterceptorOptions.throwResponse
    const { token, expiredAt, errorMessage } = stringToToken(tokenString, key);

    if (!token) {
      return false;
    }

    if (expiredAt) {
      // TODO: Refresh token?
      return false;
    }

    return token;
  }

  private async tokenToIdentity(token: Token): Promise<Identity> {
    if (token.isVerification) {
      return { entity: token, type: IdentityType.VerificationToken };
    }

    if (token.entityType === EntityType.Customer) {
      return { entity: token.entityId, type: IdentityType.Customer };
    }

    if (token.entityType === EntityType.Host) {
      const host: Host = await this.hostRepository.findHost({
        hostId: token.entityId,
      });

      return { entity: host, type: IdentityType.Host };
    }
  }

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request: Request = context.switchToHttp().getRequest();
    const controller = context.getClass();
    const handler = context.getHandler();
    const status: AuthnStatus =
      Reflect.getMetadata(AuthnStatusMetadataKey, handler) ||
      Reflect.getMetadata(AuthnStatusMetadataKey, controller) ||
      AuthnStatus.Required;

    // Skip auth checks entirely
    if (status === AuthnStatus.Skip) {
      return next.handle();
    }

    const cookies = this.getCookies(request);
    const authnResult = await this.cookieAuthnFn(cookies);

    // we should reject the request's credentials as invalid
    if (authnResult === false) {
      throwCustomException(
        'Invalid authn token cookie',
        undefined,
        HttpStatus.FORBIDDEN,
      )();
    }

    // we have a _potentially_ valid request; is it anonymous or identified?
    if (!this.shortCircuitBadAuth(authnResult, status)) {
      throwCustomException(
        'Required authn status not met',
        { requiredAuthnStatus: status },
        HttpStatus.FORBIDDEN,
      )();
    }

    (request as IdentifiedRequest<
      Identity
    >).identity = await this.tokenToIdentity(authnResult as Token).catch(
      throwCustomException('Entity not found', undefined, HttpStatus.FORBIDDEN),
    );

    return next.handle();
  }
}
