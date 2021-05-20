import { UseCase } from '../../../common/application';

export type GetHostAccountLinkPayload = Readonly<{ stripeAccountId: string }>;

export type StripeAccountLink = {
  url: string;
  expiresAt: Date;
};

export type HostAccountLink = StripeAccountLink;

export abstract class IGetHostAccountLink extends UseCase<
  GetHostAccountLinkPayload,
  HostAccountLink
> {}
