import ms from 'ms';
import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { CookieOptions, Response } from 'express';

import config from '../../app.configuration';

import {
  RequestAuthRequest,
  IRequestAuth,
} from './application/RequestAuth/IRequestAuth';
import { IVerifyAuth } from './application/VerifyAuth/IVerifyAuth';
import { Token } from './entity/Token';
import {
  AnonymousIdentity,
  VerificationTokenIdentity,
} from './infrastructure/IdentityDecorator';

@Controller('auth')
export class AuthController {
  private tokenCookieConfig: CookieOptions;
  private authCookieConfig: CookieOptions;

  constructor(
    private readonly requestAuth: IRequestAuth,
    private readonly verifyAuth: IVerifyAuth,
  ) {
    const maxAge = ms(config.cookie.tokenExpiration);

    const cookieConfig = {
      maxAge,
      ...config.cookie.cors,
    };

    this.authCookieConfig = {
      ...cookieConfig,
      httpOnly: false,
    };
    this.tokenCookieConfig = {
      ...cookieConfig,
      httpOnly: true,
    };
  }

  /**
   * First step in user auth/login. See RequestAuthn.
   */
  @Post()
  async requestAuthHandler(
    @Body() requestAuthRequest: RequestAuthRequest,
    @AnonymousIdentity() identity: null,
  ): Promise<void> {
    console.log('AUTH');
    await this.requestAuth.execute({ port: requestAuthRequest });
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
    const tokenString: string = this.verifyAuth.execute(verificationToken);

    // Newly created auth token gets signed and reset in request cookies in place of the old (verification) token
    // cookie. This auth token lets the user subsequently repeatedly authorize requests. User is logged in.
    response.cookie(
      config.cookie.tokenName,
      tokenString,
      this.tokenCookieConfig,
    );

    // The auth token is an httpOnly cookie, hence there's no straightforward way for the front-end JS to
    // check whether the user is logged in or not. We add a second, client-accessible cookie, indicating the
    // auth status of the user (auth=true or auth=false), that doesn't participate in any back-end logic.
    response.cookie(
      config.cookie.authIndicatorName,
      true,
      this.authCookieConfig,
    );

    return response.redirect('https://loclynew.netlify.app/auth/success');
  }

  // TODO: GET 'logout' causes routing conflicts with GET ':token'
  @Post('logout')
  async logoutHandler(
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    // https://expressjs.com/en/4x/api.html#res.clearCookie
    // Web browsers and other compliant clients will only clear the cookie if the given options is identical to those
    // given to res.cookie(), excluding expires and maxAge.
    response.clearCookie(config.cookie.tokenName, this.tokenCookieConfig);

    response.cookie(config.cookie.authIndicatorName, false, {
      ...this.authCookieConfig,
      // 10 years
      maxAge: 365 * 24 * 60 * 60 * 10,
    });
  }
}
