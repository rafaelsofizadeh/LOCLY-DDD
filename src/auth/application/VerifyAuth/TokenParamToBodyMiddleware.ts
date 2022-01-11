import { Injectable } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import config from '../../../../main.configuration';

@Injectable()
/**
 * User goes through the auth verification URL in the form of GET /auth/:token. TokenParamToBodyMiddleware is
 * attached to the GET /auth/:token API endpoint. :token is extracted from the URL params and attached to the request
 * cookies (cookies: token=ABC...XYZ). This is done so as to pass the verification token cookie through the global
 * AuthInterceptor and let it do its thing.
 */
export class VerificationTokenParamToBodyMiddleware {
  use(request: Request, response: Response, next: NextFunction) {
    // Should match '/auth/verify/:token'
    const { token: verificationToken } = request.params;
    request.cookies[config.cookie.tokenName] = verificationToken;

    return next();
  }
}
