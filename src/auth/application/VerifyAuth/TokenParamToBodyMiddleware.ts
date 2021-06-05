import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
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
