import ms from 'ms';
import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import {
  RequestAuthRequest,
  IRequestAuth,
} from './application/RequestAuth/IRequestAuth';
import { IVerifyAuth } from './application/VerifyAuth/IVerifyAuth';
import { Token } from './entity/Token';
import { VerificationTokenIdentity } from './infrastructure/IdentityDecorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly requestAuth: IRequestAuth,
    private readonly verifyAuth: IVerifyAuth,
  ) {}

  /**
   * First step in user auth/login. See RequestAuthn.
   */
  @Post()
  async requestAuthHandler(
    @Body() requestAuthRequest: RequestAuthRequest,
  ): Promise<void> {
    await this.requestAuth.execute(requestAuthRequest);
  }

  /**
   * Second and last step in user auth/login. See VerifyAuth.
   */
  // VerificationTokenParamToBodyMiddleware will move the :token URL param to request cookies, for
  // AuthInterceptor to operate on the token cookie.
  // --
  // VerificationTokenParamToBodyMiddleware is attached in AuthModule for this specific route.
  @Get(':token')
  async verifyAuthHandler(
    // passthrough: https://docs.nestjs.com/controllers#library-specific-approach
    @Res({ passthrough: true }) response: Response,
    @VerificationTokenIdentity() verificationToken: Token,
  ): Promise<void> {
    const authTokenString: string = this.verifyAuth.execute(verificationToken);
    const authCookieName = this.configService.get<string>('TOKEN_COOKIE_NAME');
    const authCookieMaxAge = ms(
      this.configService.get<string>('AUTH_TOKEN_EXPIRES_IN'),
    );

    // Newly created auth token gets signed and reset in request cookies in place of the old (verification) token
    // cookie. This auth token lets the user subsequently repeatedly authorize requests. User is logged in.
    response.cookie(authCookieName, authTokenString, {
      maxAge: authCookieMaxAge,
      httpOnly: true,
    });
  }

  @Get('logout')
  async logoutHandler(
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const authCookieName = this.configService.get<string>('TOKEN_COOKIE_NAME');

    response.clearCookie(authCookieName);
  }
}
