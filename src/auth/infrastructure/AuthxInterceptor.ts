import {
  CookieAuthxInterceptor,
  CookieAuthnFn,
} from '@rafaelsofizadeh/nestjs-auth';
import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { createCustomException } from '../../common/error-handling';
import { TokenIdentity } from '../entity/Token';
import { stringToToken } from '../application/utils';

export const AuthxInterceptorFactory: FactoryProvider = {
  provide: APP_INTERCEPTOR,
  useFactory: (configService: ConfigService) => {
    const cookieAuthnFn: CookieAuthnFn<TokenIdentity> = async cookies => {
      const authnCookieName = configService.get<string>('TOKEN_COOKIE_NAME');
      const tokenString: string = cookies?.[authnCookieName];

      if (!tokenString) {
        return null;
      }

      const key = configService.get<string>('TOKEN_SIGNING_KEY');
      // TODO(NOW): expiredAt isn't present, exp is
      const { token, expiredAt } = stringToToken(tokenString, key);

      if (!token) {
        return false;
      }

      if (!expiredAt) {
        // TODO: remove isIdentified requirement from IdentityBill
        return { ...token, isIdentified: true };
      }

      // TODO: Refresh token?
      return false;
    };

    return new CookieAuthxInterceptor({
      authn: { cookieAuthnFn, anonymousScopes: [] },
      throwResponse: (message: string, fnMainArgs: Record<string, any>) => {
        throw createCustomException(message, fnMainArgs);
      },
    });
  },
  inject: [ConfigService],
};
