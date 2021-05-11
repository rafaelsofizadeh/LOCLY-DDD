import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  AuthnCustomerRequest,
  IAuthnCustomer,
} from './application/AuthnCustomer/IAuthnCustomer';
import { IVerifyAuthn } from './application/VerifyAuthn/IVerifyAuthn';
import { Token } from './entity/Customer';

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
  async verifyAuthnHandler(@Param('token') token: string): Promise<Token> {
    const authnToken = this.verifyAuthn.execute(token);
    return authnToken;
  }
}
