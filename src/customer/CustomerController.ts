import { Body, Controller, Get, Param, Post, Session } from '@nestjs/common';
import { ExpressSession } from '../common/application';
import {
  AuthnCustomerRequest,
  IAuthnCustomer,
} from './application/AuthnCustomer/IAuthnCustomer';
import {
  IVerifyAuthn,
  VerifyAuthnResult,
} from './application/VerifyAuthn/IVerifyAuthn';

@Controller('authn')
export class CustomerController {
  constructor(
    private readonly authnCustomer: IAuthnCustomer,
    private readonly verifyAuthn: IVerifyAuthn,
  ) {}

  @Post('customer')
  async authnCustomerHandler(
    @Body() authnCustomerRequest: AuthnCustomerRequest,
  ): Promise<void> {
    await this.authnCustomer.execute(authnCustomerRequest);
  }

  @Get('verify/:token')
  async verifyAuthnHandler(
    @Param('token') token: string,
    @Session() expressSession: ExpressSession,
  ): Promise<void> {
    const { customerId }: VerifyAuthnResult = await this.verifyAuthn.execute({
      token,
    });

    expressSession.customerId = customerId;
  }
}
