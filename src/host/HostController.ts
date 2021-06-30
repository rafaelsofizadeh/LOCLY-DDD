import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
  HostAccountLink,
  IGetHostAccountLink,
} from './application/GetHostAccountLink/IGetHostAccountLink';
import {
  AnyHostIdentity,
  VerifiedHostIdentity,
} from '../auth/infrastructure/IdentityDecorator';
import { Host } from './entity/Host';
import { EditHostRequest, IEditHost } from './application/EditHost/IEditHost';
import {
  ISetHostAvailability,
  SetHostAvailabilityRequest,
} from './application/SetHostAvailability/ISetHostAvailability';

@Controller('host')
export class HostController {
  constructor(
    private readonly getHostAccountLink: IGetHostAccountLink,
    private readonly editHost: IEditHost,
    private readonly setHostAvailability: ISetHostAvailability,
  ) {}

  @Get('dashboard')
  async getHostAccountLinkController(
    @AnyHostIdentity() host: Host,
  ): Promise<HostAccountLink> {
    const accountLink: HostAccountLink = await this.getHostAccountLink.execute(
      host,
    );

    return accountLink;
  }

  @Patch()
  async editHostController(
    @AnyHostIdentity() host: Host,
    @Body() editHostRequest: EditHostRequest,
  ): Promise<void> {
    await this.editHost.execute({
      currentHostProperties: host,
      ...editHostRequest,
    });
  }

  @Patch('availability')
  async setHostAvailabilityController(
    @VerifiedHostIdentity() host: Host,
    @Body() setHostAvailabilityRequest: SetHostAvailabilityRequest,
  ): Promise<void> {
    await this.setHostAvailability.execute({
      host,
      ...setHostAvailabilityRequest,
    });
  }
}
