import { UseCase } from '../../../common/application';
import { Email } from '../../../common/domain';
import { Country } from '../../../order/entity/Country';
import { UserType } from '../../entity/Token';
export declare type RequestAuthPayload = Readonly<{
    email: Email;
    type: UserType;
    country?: Country;
}>;
export declare class RequestAuthRequest implements RequestAuthPayload {
    readonly email: Email;
    readonly type: UserType;
    readonly country?: Country;
}
export declare type RequestAuthResult = string;
export declare abstract class IRequestAuth extends UseCase<RequestAuthPayload, RequestAuthResult> {
}
