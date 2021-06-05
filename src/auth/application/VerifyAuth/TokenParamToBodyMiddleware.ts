import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
/**
 * User goes through the auth verification URL in the form of GET /auth/:token. TokenParamToBodyMiddleware is
 * attached to the GET /auth/:token API endpoint. :token is extracted from the URL params and attached to the request
 * cookies (cookies: token=ABC...XYZ). This is done so as to pass the verification token cookie through the global
 * AuthInterceptor and let it do its thing.
 */
export class VerificationTokenParamToBodyMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(request: Request, response: Response, next: NextFunction) {
    // Should match '/auth/verify/:token'
    const { token: verificationToken } = request.params;
    const verificationCookieName = this.configService.get<string>(
      'TOKEN_COOKIE_NAME',
    );
    request.cookies[verificationCookieName] = verificationToken;

    return next();
  }
}
