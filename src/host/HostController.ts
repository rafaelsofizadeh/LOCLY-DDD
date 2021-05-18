import { Controller, Post } from '@nestjs/common';
import { AuthzScope, Identity } from '@rafaelsofizadeh/nestjs-auth/dist';
import { EntityToken } from '../auth/entity/Token';
import {
  GetHostDashboardLinksPayload,
  HostDashboardLinks,
  IGetHostDashboardLinks,
} from './application/GetHostDashboardLinks/IGetHostDashboardLinks';

@Controller('host')
export class HostController {
  constructor(private readonly getHostDashboardLinks: IGetHostDashboardLinks) {}

  @Post('dashboard')
  @AuthzScope('account/host/unverified')
  async getHostDashbordLinksController(
    @Identity() hostIdentity: EntityToken,
  ): Promise<HostDashboardLinks> {
    const dashboardLinksPayload: GetHostDashboardLinksPayload = {
      hostId: hostIdentity.entityId,
    };

    const dashboardLinks: HostDashboardLinks = await this.getHostDashboardLinks.execute(
      dashboardLinksPayload,
    );

    return dashboardLinks;
  }
}
