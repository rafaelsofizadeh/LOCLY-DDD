import { Body, Controller, Delete, Get, Patch } from '@nestjs/common';
import {
  HostAccountLink,
  IGetHostAccountLink,
} from './application/GetHostAccountLink/IGetHostAccountLink';
import {
  AnyHostIdentity,
  VerifiedHostIdentity,
} from '../auth/infrastructure/IdentityDecorator';
import { Host, SerializedHost } from './entity/Host';
import { EditHostRequest, IEditHost } from './application/EditHost/IEditHost';
import {
  ISetHostAvailability,
  SetHostAvailabilityRequest,
} from './application/SetHostAvailability/ISetHostAvailability';
import { IGetHost } from './application/GetHost/IGetHost';
import { IDeleteHost } from './application/DeleteHost/IDeleteHost';

@Controller('host')
export class HostController {
  constructor(
    private readonly getHost: IGetHost,
    private readonly getHostAccountLink: IGetHostAccountLink,
    private readonly editHost: IEditHost,
    private readonly deleteHost: IDeleteHost,
    private readonly setHostAvailability: ISetHostAvailability,
  ) {}

  @Get()
  async getHostController(
    @AnyHostIdentity() { id: hostId }: Host,
  ): Promise<SerializedHost> {
    const {
      stripeAccountId,
      ...serializedHost
    }: Host = await this.getHost.execute({ port: { hostId } });

    return serializedHost;
  }

  @Get('dashboard')
  async getHostAccountLinkController(
    @AnyHostIdentity() host: Host,
  ): Promise<HostAccountLink> {
    const accountLink: HostAccountLink = await this.getHostAccountLink.execute({
      port: host,
    });

    return accountLink;
  }

  @Patch()
  async editHostController(
    @AnyHostIdentity() host: Host,
    @Body() editHostRequest: EditHostRequest,
  ): Promise<void> {
    await this.editHost.execute({
      port: {
        currentHostProperties: host,
        ...editHostRequest,
      },
    });
  }

  @Patch('availability')
  async setHostAvailabilityController(
    @VerifiedHostIdentity() host: Host,
    @Body() setHostAvailabilityRequest: SetHostAvailabilityRequest,
  ): Promise<void> {
    await this.setHostAvailability.execute({
      port: {
        host,
        ...setHostAvailabilityRequest,
      },
    });
  }

  @Delete()
  async deleteHostController(@AnyHostIdentity() host: Host): Promise<void> {
    await this.deleteHost.execute({ port: { hostId: host.id } });
  }
}
