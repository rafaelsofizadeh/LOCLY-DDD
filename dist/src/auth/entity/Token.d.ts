import { UUID } from '../../common/domain';
export declare enum UserType {
    Customer = "customer",
    Host = "host"
}
export declare type Token = Readonly<{
    id: UUID;
    type: UserType;
    isVerification: boolean;
}>;
