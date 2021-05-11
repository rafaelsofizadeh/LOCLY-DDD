import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  RequestAuthnCustomerRequest,
  IRequestAuthnCustomer,
} from './application/RequestAuthnCustomer/IRequestAuthnCustomer';
import { IVerifyAuthnCustomer } from './application/VerifyAuthnCustomer/IVerifyAuthnCustomer';
import { Token } from './entity/Customer';

@Controller('authn')
export class CustomerController {
  constructor(
    private readonly requestAuthnCustomer: IRequestAuthnCustomer,
    private readonly verifyAuthnCustomer: IVerifyAuthnCustomer,
  ) {}

  @Post('customer')
  async requestAuthnCustomerHandler(
    @Body() requestAuthnCustomerRequest: RequestAuthnCustomerRequest,
  ): Promise<void> {
    await this.requestAuthnCustomer.execute(requestAuthnCustomerRequest);
  }

  @Get('verify/:token')
  async verifyAuthnCustomerHandler(
    @Param('token') token: string,
  ): Promise<Token> {
    const authnToken = this.verifyAuthnCustomer.execute(token);
    return authnToken;
  }
}
