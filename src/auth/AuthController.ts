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
import {
  AnonymousIdentity,
  AnyEntityIdentity,
  VerificationTokenIdentity,
} from './infrastructure/IdentityDecorator';
import { UUID } from '../common/domain';
import { Host } from '../host/entity/Host';

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
    @AnonymousIdentity() identity: null,
  ): Promise<void> {
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

    // The auth token is an httpOnly cookie, hence there's no straightforward way for the front-end JS to
    // check whether the user is logged in or not. We add a second, client-accessible cookie, indicating the
    // auth status of the user (auth=true or auth=false), that doesn't participate in any back-end logic.
    const authIndicatorCookieName = this.configService.get<string>(
      'AUTH_INDICATOR_COOKIE_NAME',
    );

    response.cookie(authIndicatorCookieName, true, {
      httpOnly: false,
      maxAge: authCookieMaxAge,
    });

    return response.redirect('https://locly.netlify.app/');
  }

  // TODO: GET 'logout' causes routing conflicts with GET ':token'
  @Post('logout')
  async logoutHandler(
    @Res({ passthrough: true }) response: Response,
    @AnyEntityIdentity() identity: Host | UUID,
  ): Promise<void> {
    const authCookieName = this.configService.get<string>('TOKEN_COOKIE_NAME');
    response.clearCookie(authCookieName);

    const authIndicatorCookieName = this.configService.get<string>(
      'AUTH_INDICATOR_COOKIE_NAME',
    );
    response.cookie(authIndicatorCookieName, false, {
      httpOnly: false,
      maxAge: 365 * 24 * 60 * 60 * 10,
    });
  }
}
