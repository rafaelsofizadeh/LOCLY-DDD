import { UseCase } from '../../../common/application';
import { UUID } from '../../../common/domain';

export type GetHostAccountLinkPayload = Readonly<{ hostId: UUID }>;

export type StripeAccountLink = {
  url: string;
  expiresAt: Date;
};

export type HostAccountLink = StripeAccountLink;

export abstract class IGetHostAccountLink extends UseCase<
  GetHostAccountLinkPayload,
  HostAccountLink
> {}
