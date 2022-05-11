import { UseCase } from '../../../common/application';
export declare type GetHostAccountLinkPayload = Readonly<{
    stripeAccountId: string;
}>;
export declare type StripeAccountLink = {
    url: string;
    expiresAt?: Date;
};
export declare type HostAccountLink = StripeAccountLink;
export declare abstract class IGetHostAccountLink extends UseCase<GetHostAccountLinkPayload, HostAccountLink> {
}
