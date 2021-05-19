import {
  CookieAuthxInterceptor,
  CookieAuthnFn,
} from '@rafaelsofizadeh/nestjs-auth';
import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { createCustomException } from '../../common/error-handling';
import { EntityTypeWithStatus, Token } from '../entity/Token';
import { stringToToken } from '../application/utils';
import { IHostRepository } from '../../host/persistence/IHostRepository';
import { Host } from '../../host/entity/Host';
import Stripe from 'stripe';
import {
  InjectStripeClient,
  STRIPE_CLIENT_TOKEN,
} from '@golevelup/nestjs-stripe';
import { inspect } from 'util';

export const AuthxInterceptorFactory: FactoryProvider = {
  provide: APP_INTERCEPTOR,
  useFactory: (
    configService: ConfigService,
    hostRepository: IHostRepository,
    stripe: Stripe,
  ) => {
    const cookieAuthnFn: CookieAuthnFn<Token> = async cookies => {
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

      if (expiredAt) {
        // TODO: Refresh token?
        return false;
      }

      if (
        token.entityType === EntityTypeWithStatus.Host ||
        token.entityType === EntityTypeWithStatus.UnverifiedHost
      ) {
        const { stripeAccountId }: Host = await hostRepository.findHost({
          hostId: token.entityId,
        });

        // TODO: Move to AccountUpdated webhook and set a property on host db document
        const hostStripeAccount: Stripe.Account = await stripe.accounts.retrieve(
          stripeAccountId,
        );

        const isHostCurrentlyVerified =
          hostStripeAccount.charges_enabled && //
          hostStripeAccount.payouts_enabled && //
          hostStripeAccount.requirements.currently_due.length === 0 && //
          // TODO: Should I check capabilities?
          hostStripeAccount.capabilities.card_payments === 'active' && // 
          hostStripeAccount.capabilities.transfers === 'active'; //

        token.entityType = isHostCurrentlyVerified
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
  inject: [ConfigService, IHostRepository, STRIPE_CLIENT_TOKEN],
};
