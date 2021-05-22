import { Controller, Get } from '@nestjs/common';
import {
  HostAccountLink,
  IGetHostAccountLink,
} from './application/GetHostAccountLink/IGetHostAccountLink';
import { AnyHostIdentity } from '../auth/infrastructure/decorators/identity';
import { Host } from './entity/Host';

@Controller('host')
export class HostController {
  constructor(private readonly getHostAccountLink: IGetHostAccountLink) {}

  @Get('dashboard')
  async getHostAccountLinkController(
    @AnyHostIdentity() host: Host,
  ): Promise<HostAccountLink> {
    const accountLink: HostAccountLink = await this.getHostAccountLink.execute(
      host,
    );

    return accountLink;
  }
}
