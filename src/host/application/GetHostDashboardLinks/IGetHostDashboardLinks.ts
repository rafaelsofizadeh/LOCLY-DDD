import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { UnidHostOrderRequest } from '../../../order/entity/Order';

export interface GetHostDashboardLinksPayload
  extends Readonly<{ hostId: UUID }> {}

class GetHostDashboardLinksRequest
  implements UnidHostOrderRequest<GetHostDashboardLinksRequest> {}

export type StripeAccountLink = {
  url: string;
  expiresAt: Date;
};

export interface HostDashboardLinks
  extends Readonly<{
    onboardingLink: StripeAccountLink;
  }> {}

export abstract class IGetHostDashboardLinks extends UseCase<
  GetHostDashboardLinksPayload,
  HostDashboardLinks
> {}
