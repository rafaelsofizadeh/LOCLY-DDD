import { Request } from 'express';
import { UUID } from '../../common/domain';
import { Host } from '../../host/entity/Host';
import { Token } from './Token';
export declare type IdentifiedRequest<T> = Request & {
    identity: T;
};
export declare enum IdentityType {
    Customer = "customer",
    Host = "host",
    UnverifiedHost = "unverified_host",
    VerificationToken = "verification_token",
    Anonymous = "anonymous"
}
declare type CustomerId = UUID;
export declare type Identity = {
    entity: CustomerId | Host | Token | null;
    type: IdentityType;
};
export {};
