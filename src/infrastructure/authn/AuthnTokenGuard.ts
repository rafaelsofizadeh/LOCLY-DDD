import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { Token } from '../../customer/entity/Customer';
import { CustomerAuthnVerificationPayload } from '../../customer/application/RequestAuthnCustomer/IRequestAuthnCustomer';
import { AuthnStatus, AUTHN_STATUS } from './AuthnDecorators';

@Injectable()
export class AuthnTokenGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const controller = context.getClass();
    const handler = context.getHandler();
    const status: AuthnStatus =
      Reflect.getMetadata(AUTHN_STATUS, handler) ||
      Reflect.getMetadata(AUTHN_STATUS, controller) ||
      AuthnStatus.Required;

    const authnCookieName = this.configService.get<string>('AUTHN_COOKIE_NAME');
    const authnToken: Token =
      request.cookies?.[authnCookieName] ||
      request.signedCookies?.[authnCookieName];
    const isIdentified = Boolean(authnToken);
    const isAnonymous = !isIdentified;

    switch (status) {
      case AuthnStatus.Required:
        if (isIdentified) {
          const payload = this.validateAuthnToken(authnToken);

          if (!payload) {
            return false;
          }

          // TODO: Safer way to override customerId
          request.body.customerId = payload.customerId;
          return true;
        }

        return false;
      case AuthnStatus.Disallowed:
        return isAnonymous;
      case AuthnStatus.Optional:
        return true; // doesn't matter
      default:
        throw new Error(
          `Bad AuthnStatus value (are you not in TypeScript?): ${status}`,
        );
    }
  }

  private validateAuthnToken(
    token: Token,
  ): CustomerAuthnVerificationPayload | undefined {
    try {
      const key = this.configService.get<string>('AUTHN_JWT_SIGNING_KEY');

      const payload = jwt.verify(
        token,
        key,
      ) as CustomerAuthnVerificationPayload;

      return payload;
    } catch ({ name: errorName, message }) {
      if (errorName === 'TokenExpiredError') {
        // TODO: Regenerate?
      }

      return undefined;
    }
  }
}
