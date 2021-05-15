import { CookieAuthxInterceptor, CookieAuthnFn } from '@eropple/nestjs-auth';
import jwt from 'jsonwebtoken';
import { FactoryProvider, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { throwCustomException } from '../../common/error-handling';
import {
  CustomerGrants,
  EntityTokenType,
  HostGrants,
  Identity,
  MiscTokenType,
  Token,
  TokenPayload,
  UnverifiedHostGrants,
  VerificationTokenPayload,
} from '../entity/Token';

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
  for: 'customer' | 'unverified_host' | 'host';
  type: 'verification';
  refresh: false;
}
*/

export const AuthxInterceptorFactory: FactoryProvider = {
  provide: APP_INTERCEPTOR,
  useFactory: (configService: ConfigService) => {
    // TODO: Extract to a separate fn [RELATED: VerifyAuthn TODO]
    const cookieAuthnFn: CookieAuthnFn<Identity> = async cookies => {
      const authnCookieName = configService.get<string>(
        'AUTHN_TOKEN_COOKIE_NAME',
      );
      const tokenString: string = cookies?.[authnCookieName];

      if (!tokenString) {
        return null;
      }

      const key = configService.get<string>('AUTHN_TOKEN_SIGNING_KEY');

      const { payload, expiredAt } = validateAndDecodeTokenPayload(
        tokenString,
        key,
      );

      if (!payload) {
        // TODO: Error message
        return false;
      }

      if (!expiredAt) {
        const token: Token = payloadToToken(payload);
        // TODO: remove isIdentified requirement from IdentityBill
        return { ...token, isIdentified: true };
      }
    };

    return new CookieAuthxInterceptor({
      authn: { cookieAuthnFn, anonymousScopes: [] },
    });
  },
  inject: [ConfigService],
};

export function validateAndDecodeTokenPayload(
  token: string,
  key: string,
): { payload?: TokenPayload; expiredAt?: number; errorMessage?: string } {
  let payload: TokenPayload;

  try {
    payload = jwt.verify(token, key) as TokenPayload;

    return { payload };
  } catch ({ name, expiredAt, message: errorMessage }) {
    if (name === 'TokenExpiredError') {
      return {
        payload,
        expiredAt,
        errorMessage,
      };
    }

    if (name === 'JsonWebTokenError') {
      return {
        errorMessage,
      };
    }
  }
}

export function payloadToToken({
  type,
  entityId,
  ...restTokenPayload
}: TokenPayload): Token {
  switch (type) {
    case EntityTokenType.Customer:
      return {
        customerId: entityId,
        grants: CustomerGrants,
        refresh: true,
      };
    case EntityTokenType.UnverifiedHost:
      return {
        hostId: entityId,
        grants: UnverifiedHostGrants,
        refresh: true,
      };
    case EntityTokenType.Host:
      return {
        hostId: entityId,
        grants: HostGrants,
        refresh: true,
      };
    case MiscTokenType.Verification:
      const { for: forEntity } = restTokenPayload as Omit<
        VerificationTokenPayload,
        'type' | 'entityId'
      >;

      const entityIdObj =
        forEntity === EntityTokenType.Customer
          ? { customerId: entityId }
          : { hostId: entityId };

      return {
        ...entityIdObj,
        type: MiscTokenType.Verification,
        grants: [],
        refresh: false,
      };
    default:
      throwCustomException(
        'Invalid token',
        arguments[0],
        HttpStatus.UNAUTHORIZED,
      )();
  }
}
