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

/*
1. Customer

{
  entityId: UUID;
  type: 'customer';
  grants: ['account/customer/*', 'order/customer/*'];
  refresh: true;
}

2. Unverified Host

{
  entityId: UUID;
  type: 'unverified_host';
  grants: ['account/host/unverified/*'];
  refresh: true;
}

3. Host

{
  entityId: UUID;
  type: 'host';
  grants: ['account/host/*', 'order/host/*'];
  refresh: true;
}

4. Admin

{
  type: 'admin';
  grants: ['*'];
}

5. Verification

{
  entityId: UUID;
  forEntity: 'customer' | 'unverified_host' | 'host';
  type: 'verification';
  refresh: false;
}
*/

export const AuthxInterceptorFactory: FactoryProvider = {
  provide: APP_INTERCEPTOR,
  useFactory: (configService: ConfigService) => {
    // TODO: Extract to a separate fn [RELATED: VerifyAuthn TODO]
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
        // TODO: Error message
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
