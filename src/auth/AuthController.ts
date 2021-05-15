import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import ms from 'ms';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import {
  RequestAuthnRequest,
  IRequestAuthn,
} from './application/RequestAuthn/IRequestAuthn';
import { IVerifyAuthn } from './application/VerifyAuthn/IVerifyAuthn';
import { AuthnDisallowed, AuthnRequired } from '@eropple/nestjs-auth';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly requestAuthn: IRequestAuthn,
    private readonly verifyAuthn: IVerifyAuthn,
  ) {}

  @AuthnDisallowed()
  @Post()
  async requestAuthnHandler(
    @Body() requestAuthnRequest: RequestAuthnRequest,
  ): Promise<void> {
    await this.requestAuthn.execute(requestAuthnRequest);
  }

  @AuthnDisallowed()
  @Get('verify/:token')
  async verifyAuthnHandler(
    // passthrough: https://docs.nestjs.com/controllers#library-specific-approach
    @Res({ passthrough: true }) response: Response,
    @Param('token') token: string,
  ): Promise<void> {
    const authnToken = this.verifyAuthn.execute(token);
    const authnCookieName = this.configService.get<string>(
      'AUTHN_TOKEN_COOKIE_NAME',
    );
    const authnCookieMaxAge = ms(
      this.configService.get<string>('AUTHN_TOKEN_EXPIRES_IN'),
    );

    response.cookie(authnCookieName, authnToken, {
      maxAge: authnCookieMaxAge,
      signed: true,
      httpOnly: true,
    });
  }

  @AuthnRequired()
  @Post('logout')
  async logoutHandler(
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const authnCookieName = this.configService.get<string>(
      'AUTHN_TOKEN_COOKIE_NAME',
    );

    response.clearCookie(authnCookieName);
  }
}
