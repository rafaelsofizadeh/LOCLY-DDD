import ms from 'ms';
import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import {
  RequestAuthnRequest,
  IRequestAuthn,
} from './application/RequestAuthn/IRequestAuthn';
import { IVerifyAuthn } from './application/VerifyAuthn/IVerifyAuthn';
import { Token } from './entity/Token';
import { VerificationTokenIdentity } from './infrastructure/decorators/identity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly requestAuthn: IRequestAuthn,
    private readonly verifyAuthn: IVerifyAuthn,
  ) {}

  @Post()
  async requestAuthnHandler(
    @Body() requestAuthnRequest: RequestAuthnRequest,
  ): Promise<void> {
    await this.requestAuthn.execute(requestAuthnRequest);
  }

  // TokenParamToBodyMiddleware will move the :token URL param to request cookies, for
  // AuthInterceptor to operate on the token cookie.
  @Get(':token')
  async verifyAuthnHandler(
    // passthrough: https://docs.nestjs.com/controllers#library-specific-approach
    @Res({ passthrough: true }) response: Response,
    @VerificationTokenIdentity() verificationToken: Token,
  ): Promise<void> {
    const authnTokenString: string = this.verifyAuthn.execute(
      verificationToken,
    );
    const authnCookieName = this.configService.get<string>('TOKEN_COOKIE_NAME');
    const authnCookieMaxAge = ms(
      this.configService.get<string>('AUTHN_TOKEN_EXPIRES_IN'),
    );

    response.cookie(authnCookieName, authnTokenString, {
      maxAge: authnCookieMaxAge,
      httpOnly: true,
    });
  }

  @Get('logout')
  async logoutHandler(
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const authnCookieName = this.configService.get<string>('TOKEN_COOKIE_NAME');

    response.clearCookie(authnCookieName);
  }
}
