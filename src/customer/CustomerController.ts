import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import ms from 'ms';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import {
  RequestAuthnCustomerRequest,
  IRequestAuthnCustomer,
} from './application/RequestAuthnCustomer/IRequestAuthnCustomer';
import { IVerifyAuthnCustomer } from './application/VerifyAuthnCustomer/IVerifyAuthnCustomer';
import { AuthnDisallowed, AuthnRequired } from '@eropple/nestjs-auth';

@Controller('authn')
export class CustomerController {
  constructor(
    private readonly configService: ConfigService,
    private readonly requestAuthnCustomer: IRequestAuthnCustomer,
    private readonly verifyAuthnCustomer: IVerifyAuthnCustomer,
  ) {}

  @AuthnDisallowed()
  @Post('customer')
  async requestAuthnCustomerHandler(
    @Body() requestAuthnCustomerRequest: RequestAuthnCustomerRequest,
  ): Promise<void> {
    await this.requestAuthnCustomer.execute(requestAuthnCustomerRequest);
  }

  @AuthnDisallowed()
  @Get('verify/:token')
  async verifyAuthnCustomerHandler(
    // passthrough: https://docs.nestjs.com/controllers#library-specific-approach
    @Res({ passthrough: true }) response: Response,
    @Param('token') token: string,
  ): Promise<void> {
    const authnToken = this.verifyAuthnCustomer.execute(token);
    const authnCookieName = this.configService.get<string>('AUTHN_COOKIE_NAME');

    response.cookie(authnCookieName, authnToken, {
      maxAge: ms(this.configService.get<string>('AUTHN_COOKIE_EXPIRES_IN')),
      signed: true,
      httpOnly: true,
    });
  }

  @AuthnRequired()
  @Post('logout')
  async logoutHandler(
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const authnCookieName = this.configService.get<string>('AUTHN_COOKIE_NAME');

    response.clearCookie(authnCookieName);
  }
}
