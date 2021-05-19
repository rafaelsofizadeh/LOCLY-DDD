import { Controller, Get } from '@nestjs/common';
import { AuthzScope, Identity } from '@eropple/nestjs-auth/dist';
import { Token } from '../auth/entity/Token';
import {
  HostAccountLink,
  IGetHostAccountLink,
} from './application/GetHostAccountLink/IGetHostAccountLink';

@Controller('host')
export class HostController {
  constructor(private readonly getHostAccountLink: IGetHostAccountLink) {}

  @Get('dashboard')
  @AuthzScope(['account/host'])
  async getHostAccountLinkController(
    @Identity() { entityId: hostId }: Token,
  ): Promise<HostAccountLink> {
    const accountLink: HostAccountLink = await this.getHostAccountLink.execute({
      hostId,
    });

    return accountLink;
  }
}
