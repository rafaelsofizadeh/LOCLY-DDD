import { CookieAuthxInterceptor, CookieAuthnFn } from '@eropple/nestjs-auth';
import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { createCustomException } from '../../common/error-handling';
import { EntityTypeWithStatus, Token } from '../entity/Token';
import { stringToToken } from '../application/utils';
import { IHostRepository } from '../../host/persistence/IHostRepository';
import { Host } from '../../host/entity/Host';

export const AuthxInterceptorFactory: FactoryProvider = {
  provide: APP_INTERCEPTOR,
  useFactory: (
    configService: ConfigService,
    hostRepository: IHostRepository,
  ) => {
    const cookieAuthnFn: CookieAuthnFn<Token> = async cookies => {
      const authnCookieName = configService.get<string>('TOKEN_COOKIE_NAME');
      const tokenString: string = cookies?.[authnCookieName];

      if (!tokenString) {
        return null;
      }

      const key = configService.get<string>('TOKEN_SIGNING_KEY');
      // TODO: Error message pass to CookieAuthxInterceptorOptions.throwResponse
      const { token, expiredAt, errorMessage } = stringToToken(
        tokenString,
        key,
      );

      if (!token) {
        return false;
      }

      if (expiredAt) {
        // TODO: Refresh token?
        return false;
      }

      if (
        [
          EntityTypeWithStatus.Host,
          EntityTypeWithStatus.UnverifiedHost,
        ].includes(token.entityType)
      ) {
        // TODO: Do I really need any properties in HostToken apart from { entityId, entityType } if I query
        // hostRepository on every request anyway?

        // TODO: Should I populate the identity with the entire Host object and not have to query it again
        // down the line?
        const { verified }: Host = await hostRepository.findHost({
          hostId: token.entityId,
        });

        token.entityType = verified
          ? EntityTypeWithStatus.Host
          : EntityTypeWithStatus.UnverifiedHost;
      }

      return token;
    };

    return new CookieAuthxInterceptor({
      authn: { cookieAuthnFn, anonymousScopes: [] },
      throwResponse: (message: string, fnMainArgs: Record<string, any>) => {
        throw createCustomException(message, fnMainArgs);
      },
    });
  },
  inject: [ConfigService, IHostRepository],
};
