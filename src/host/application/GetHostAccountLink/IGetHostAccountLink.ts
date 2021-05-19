import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';
import { UnidHostOrderRequest } from '../../../order/entity/Order';

export enum HostAccountLinkType {
  Onboarding = 'account_onboarding',
  ProfileUpdate = 'account_update',
}

export interface GetHostAccountLinkPayload
  extends Readonly<{ hostId: UUID; accountLinkType: HostAccountLinkType }> {}

class GetHostAccountLinkRequest
  implements UnidHostOrderRequest<GetHostAccountLinkRequest> {}

export type StripeAccountLink = {
  url: string;
  expiresAt: Date;
};

export type HostAccountLink = StripeAccountLink;

export abstract class IGetHostAccountLink extends UseCase<
  GetHostAccountLinkPayload,
  HostAccountLink
> {}
