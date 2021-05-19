import { Controller, Get } from '@nestjs/common';
import { AuthzScope, Identity } from '@rafaelsofizadeh/nestjs-auth/dist';
import { EntityTypeWithStatus, TokenIdentity } from '../auth/entity/Token';
import { throwCustomException } from '../common/error-handling';
import {
  HostAccountLink,
  HostAccountLinkType,
  IGetHostAccountLink,
} from './application/GetHostAccountLink/IGetHostAccountLink';

@Controller('host')
export class HostController {
  constructor(private readonly getHostAccountLink: IGetHostAccountLink) {}

  @Get('dashboard')
  @AuthzScope(['account/host'])
  async getHostAccountLinkController(
    @Identity() { entityId: hostId, entityType: hostType }: TokenIdentity,
  ): Promise<HostAccountLink> {
    let accountLinkType: HostAccountLinkType;

    if (hostType === EntityTypeWithStatus.Host) {
      accountLinkType = HostAccountLinkType.ProfileUpdate;
    } else if (hostType === EntityTypeWithStatus.UnverifiedHost) {
      accountLinkType = HostAccountLinkType.Onboarding;
    } else {
      throwCustomException('Invalid Host type', { hostType })();
    }

    const accountLink: HostAccountLink = await this.getHostAccountLink.execute({
      hostId,
      accountLinkType,
    });

    return accountLink;
  }
}
